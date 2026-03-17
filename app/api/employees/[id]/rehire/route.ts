import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Ensure the correct import path

// Rehire Employee API
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Unwrap the Promise from params and get the employee ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Fetch the employee from the database
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single(); // Get a single employee record based on ID

    if (employeeError || !employee) {
      console.error("Employee not found:", employeeError);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Fetch the most recent termination history for this employee
    const { data: terminationHistory, error: terminationError } = await supabase
      .from("termination_history")
      .select("termination_date")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false }) // Order by most recent termination
      .limit(1); // Get only the most recent termination date

    if (terminationError) {
      console.error("Error fetching termination history:", terminationError);
      return NextResponse.json({ error: "Error fetching termination history" }, { status: 500 });
    }

    // If no termination history exists, allow rehiring (i.e., status change without termination date)
    const termination_date = terminationHistory?.[0]?.termination_date || null;

    // Rehire logic: Update the employee's status to "Active" without referencing termination_date in the employee table
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        status: "Active",  // Set status to Active
      })
      .eq("id", id); // Update based on the employee ID

    if (updateError) {
      console.error("Error updating employee status:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Respond back with success and the updated employee status
    return NextResponse.json({
      success: true,
      message: "Employee re-hired successfully",
      employee_id: id,
      status: "Active", // Return the updated status
    });
  } catch (err) {
    console.error("Rehire error:", err);
    return NextResponse.json({ error: "Error rehiring employee" }, { status: 500 });
  }
}