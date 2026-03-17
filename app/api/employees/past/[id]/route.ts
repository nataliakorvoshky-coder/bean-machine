import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your URL and service key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fetch employee details and termination history (GET)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  try {
    // Fetch employee details
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select(`id, name, status, hire_date, rank_id`)
      .eq("id", id)
      .maybeSingle();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Fetch most recent termination history
    const { data: terminationHistory, error: terminationError } = await supabase
      .from("termination_history")
      .select("termination_date, reason, rehire_status")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false })
      .limit(1); // Get the most recent termination record

    // If no termination history, return an empty array instead of an error
    if (terminationError) {
      console.error("Error fetching termination history:", terminationError);
    }

    const terminationDate = terminationHistory?.[0]?.termination_date
      ? new Date(terminationHistory[0]?.termination_date).toLocaleDateString()
      : "N/A"; // If no termination date, use "N/A"
    
    const rehireStatus = terminationHistory?.[0]?.rehire_status || "N/A"; // Get rehire status if it exists

    // Return employee data and the most recent termination history (including rehire status)
    return NextResponse.json({
      ...employee,
      termination_date: terminationDate,
      rehire_status: rehireStatus,
      termination_history: terminationHistory ?? [],
    });
  } catch (err) {
    console.error("Error fetching employee data:", err);
    return NextResponse.json({ error: "Failed to fetch employee data" }, { status: 500 });
  }
}

// Handle POST request for rehire status update
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params; // Get the employee's ID
  const { rehire_status } = await req.json(); // Get rehire status from the body

  if (!rehire_status || !["Eligible", "Ineligible"].includes(rehire_status)) {
    return NextResponse.json({ error: "Invalid rehire status" }, { status: 400 });
  }

  try {
    // Fetch the most recent termination record first to ensure the correct one is being updated
    const { data: latestTermination, error: fetchError } = await supabase
      .from("termination_history")
      .select("id, rehire_status")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false })
      .limit(1)
      .single(); // Get the most recent termination record

    if (fetchError || !latestTermination) {
      console.error("Termination history not found for update:", fetchError);
      return NextResponse.json({ error: "Termination history not found" }, { status: 404 });
    }

    // Update only the rehire status in the most recent termination record
    const { data, error } = await supabase
      .from("termination_history")
      .update({ rehire_status }) // Update the rehire status
      .eq("id", latestTermination.id) // Update only the most recent termination record
      .single(); // Update single record

    if (error) {
      console.error("Error updating rehire status:", error);
      return NextResponse.json({ error: `Failed to update rehire status: ${error.message}` }, { status: 500 });
    }

    // Return the updated termination data
    return NextResponse.json({ success: true, updated_termination: data });
  } catch (err) {
    console.error("Error updating rehire status:", err);
    return NextResponse.json({ error: "Server error updating rehire status" }, { status: 500 });
  }
}