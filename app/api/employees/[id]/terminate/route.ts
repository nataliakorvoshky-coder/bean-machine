import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; 

// POST method to terminate and overwrite employee termination data
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Get the employee ID from params
    const { termination_date, rehire_status } = await req.json();  // Get termination_date and rehire_status from the request body

    // Basic validation: Ensure termination_date and rehire_status are provided
    if (!termination_date || !rehire_status) {
      return NextResponse.json({ error: "Termination date and rehire status are required" }, { status: 400 });
    }

    console.log("Termination request received for employee ID:", id);  // Debug log

    // Fetch the current employee details including the rank before termination
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("rank_id, status")
      .eq("id", id)
      .maybeSingle();

    if (employeeError || !employee) {
      console.error("Employee not found:", employeeError); 
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    console.log("Employee found:", employee);  // Debug log showing employee details

    // Fetch the rank details to ensure we're using the correct UUID for rank
    const { data: rankData, error: rankError } = await supabase
      .from("employee_ranks")
      .select("id")
      .eq("id", employee.rank_id)
      .maybeSingle();

    if (rankError || !rankData) {
      console.error("Rank not found:", rankError); 
      return NextResponse.json({ error: "Rank not found" }, { status: 404 });
    }

    // Perform the update using valid UUID for the rank_id, termination_date, and rehire_status
    const { data, error } = await supabase
      .from("employees")
      .update({
        status: "Terminated",  // Set employee status to "Terminated"
        termination_date: termination_date,  // Use the termination date from the popup
        rehire_status: rehire_status,  // Use the rehire status from the popup
        last_rank_before_termination: rankData.id,  // Store the rank UUID of the employee
      })
      .eq("id", id)
      .select() // Fetch the updated employee data
      .maybeSingle();

    if (error || !data) {
      console.error("Error during termination update:", error); 
      return NextResponse.json({ error: "Error updating employee status" }, { status: 500 });
    }

    // Log the updated data
    console.log("Termination successful, updated employee:", data);  // Log the updated data after termination

    // Return updated employee data with success message
    return NextResponse.json({
      success: true,
      message: "Employee terminated successfully",
      updated_employee: data,  // Return updated employee data
    });
  } catch (err) {
    console.error("Error updating employee status:", err);  // Log error if the try-catch block catches one
    return NextResponse.json({ error: "Server error updating status" }, { status: 500 });
  }
}