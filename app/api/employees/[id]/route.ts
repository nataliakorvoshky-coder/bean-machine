import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Ensure the correct import path

// GET method to fetch basic employee details for the profile page
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Unwrap params as it is a Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

    // Fetch employee details from the employee table
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        status,
        rank_id,
        hire_date,
        termination_date,
        phone,
        cid,
        iban,
        last_promotion_date,
        is_admin_employee
      `)
      .eq("id", id)
      .single(); // Fetch single employee data based on ID

    if (employeeError || !employee) {
      console.error("Employee not found:", employeeError);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Fetch rank details using the rank_id from the employee table
    const { data: rank, error: rankError } = await supabase
      .from("employee_ranks")
      .select("rank_name, wage")
      .eq("id", employee.rank_id)
      .single(); // Fetch single rank based on rank_id

    if (rankError || !rank) {
      console.error("Error fetching rank:", rankError);
      return NextResponse.json({ error: "Rank not found" }, { status: 404 });
    }

    // Return combined data (employee details + rank details)
    return NextResponse.json({
      ...employee,
      rank: rank?.rank_name ?? "Unassigned", // Default to "Unassigned" if rank is null
      wage: rank?.wage ?? 0, // Default to 0 if wage is null
    });
  } catch (err) {
    console.error("Error fetching employee:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST method to update employee status
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Unwrap params to get the employee id
    const { id } = await params;
    const { status } = await req.json(); // Get the new status from the request body

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Implement check to prevent updating for "Coffee Panda" rank
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .single();

    if (employeeError || !employee) {
      console.error("Error fetching employee:", employeeError);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Check if the employee's rank is "Coffee Panda" (id: 1)
    if (employee.rank_id === 1) {  // Assuming 1 is "Coffee Panda"
      return NextResponse.json({ error: "Cannot update status for Coffee Panda rank" }, { status: 400 });
    }

    // Update the employee's status in the database
    const { data, error } = await supabase
      .from("employees")
      .update({ status })
      .eq("id", id)
      .select() // Select the updated employee data
      .single(); // Fetch the updated employee data

    if (error || !data) {
      console.error("Error updating employee status:", error);
      return NextResponse.json({ error: "Error updating status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_employee: data });
  } catch (err) {
    console.error("POST EMPLOYEE STATUS ERROR:", err);
    return NextResponse.json({ error: "Server error updating status" }, { status: 500 });
  }
}