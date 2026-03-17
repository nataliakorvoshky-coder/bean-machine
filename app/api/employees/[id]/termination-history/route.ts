import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Ensure the correct import path

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params; // Extract employee UUID from the URL parameters

    // Query termination history from the database
    const { data: terminationHistory, error } = await supabase
      .from("termination_history")
      .select("*")
      .eq("employee_id", id);  // Ensure employee_id matches the UUID

    if (error) {
      console.error("Error fetching termination history:", error);
      return NextResponse.json({ error: "Error fetching termination history" }, { status: 500 });
    }

    // Handle case where no records are found
    if (!terminationHistory || terminationHistory.length === 0) {
      // Return an empty array if no termination history is found
      return NextResponse.json([], { status: 200 });
    }

    // Return the termination history if records are found
    return NextResponse.json(terminationHistory);
  } catch (err) {
    console.error("Error loading termination history:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// POST method to handle termination history update (adding new termination history)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params; // Await to unwrap params and get the employee ID
    const { reason } = await req.json(); // Get termination reason from the request body

    // Ensure the employee ID and reason are provided
    if (!id || !reason) {
      return NextResponse.json({ error: "Missing employee ID or termination reason" }, { status: 400 });
    }

    // Set the current date as the termination date if not provided
    const termination_date = new Date().toISOString(); // Use the current date as termination date

    // Insert the termination history into the database
    const { data, error } = await supabase
      .from("termination_history")
      .insert([{
        employee_id: id, // Assuming 'employee_id' is UUID
        termination_date,
        reason,
      }]);

    // Handle error if insertion fails
    if (error) {
      console.error("Error inserting termination history:", error);
      return NextResponse.json({ error: "Error updating termination history" }, { status: 500 });
    }

    // Update employee status to "Terminated"
    const { error: updateError } = await supabase
      .from("employees")
      .update({ status: "Terminated" })
      .eq("id", id); // Assuming 'id' is UUID in 'employees' table

    if (updateError) {
      console.error("Error updating employee status:", updateError);
      return NextResponse.json({ error: "Error updating employee status" }, { status: 500 });
    }

    // Return the updated termination history and success response
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("Error in termination history POST:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params; // Extract the employee UUID from the URL
    
    // Read the terminationId from the request body
    const { terminationId } = await req.json(); // Ensure the body contains terminationId

    // Ensure that terminationId and employee id are provided
    if (!id || !terminationId) {
      return NextResponse.json({ error: "Missing employee ID or termination history ID" }, { status: 400 });
    }

    // Fetch the termination history entry for validation (ensure employee_id matches the UUID)
    const { data: terminationHistory, error: fetchError } = await supabase
      .from("termination_history")
      .select("*")
      .eq("employee_id", id)        // Ensure it matches the employee's UUID
      .eq("id", terminationId)      // Match the termination history ID (which is an integer)
      .single();                    // Fetch a single record to ensure uniqueness

    if (fetchError || !terminationHistory) {
      console.error("Termination history not found:", fetchError);
      return NextResponse.json({ error: "Termination history not found" }, { status: 404 });
    }

    // Proceed with deletion if the termination history exists
    const { data, error } = await supabase
      .from("termination_history")
      .delete()
      .eq("id", terminationId)  // Match the termination history ID (primary key)
      .eq("employee_id", id);   // Ensure employee_id matches the given employee ID (UUID)

    if (error) {
      console.error("Error deleting termination history:", error);
      return NextResponse.json({ error: "Error deleting termination history" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("Error in termination history DELETE:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}