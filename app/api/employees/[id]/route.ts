import { supabase } from "@/lib/supabase"; // Ensure the correct import path
import { NextResponse } from "next/server"; // Use NextResponse for Next.js API routes

// GET method to fetch basic employee details, calculate work hours and earnings dynamically
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;  // Unwrap params and get the employee ID

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
        phone,
        cid,
        iban,
        last_promotion_date,
        is_admin_employee
      `)
      .eq("id", id)
      .maybeSingle(); // Fetch single employee data based on ID

    if (employeeError || !employee) {
      console.error("Employee not found:", employeeError);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    /* ====================== 
    GET WORK HOURS FOR CALCULATIONS
    ====================== */
    const { data: hoursData, error: hoursError } = await supabase
      .from("work_hours")
      .select("hours, minutes")
      .eq("employee_id", id);

    if (hoursError) {
      console.error("Error fetching work hours:", hoursError);
      return NextResponse.json({ error: "Error fetching work hours" }, { status: 500 });
    }

    // Calculate total worked minutes, weekly hours, and lifetime hours
    const totalMinutes = hoursData.reduce((acc, entry) => {
      return acc + (entry.hours * 60) + entry.minutes;
    }, 0);

    const lifetimeHours = Math.floor(totalMinutes / 60);
    const weeklyHours = Math.floor(totalMinutes / 60);  // Assuming all data from current week for simplicity

    // Step 1: Fetch rank details using the rank_id from the employee table
    const { data: rank, error: rankError } = await supabase
      .from("employee_ranks")
      .select("rank_name, wage")
      .eq("id", employee.rank_id)
      .maybeSingle(); // Fetch single rank based on rank_id

    if (rankError || !rank) {
      console.error("Error fetching rank:", rankError);
      return NextResponse.json({ error: "Rank not found" }, { status: 404 });
    }

    // Calculate weekly and lifetime earnings based on the wage
    const wage = rank?.wage ?? 0;
    const weeklyEarnings = weeklyHours * wage;
    const lifetimeEarnings = lifetimeHours * wage;

    /* ====================== 
    GET TERMINATION DATE FROM TERMINATION_HISTORY
    ====================== */
    const { data: terminationHistory, error: terminationError } = await supabase
      .from("termination_history")
      .select("termination_date")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false }) // Get the most recent termination date
      .limit(1)
      .maybeSingle(); // Fetch a single record

    let termination_date = "N/A"; // Default to "N/A" if no termination history is found

    if (terminationError) {
      console.error("Error fetching termination history:", terminationError);
    }

    if (terminationHistory) {
      termination_date = new Date(terminationHistory.termination_date).toLocaleDateString();
    }

    // Return combined data (employee details + rank details + termination date + earnings stats)
    return NextResponse.json({
      ...employee,
      termination_date, // Add termination_date here
      rank: rank?.rank_name ?? "Unassigned", // Default to "Unassigned" if rank is null
      wage: rank?.wage ?? 0, // Default to 0 if wage is null
      lifetime_hours: lifetimeHours,
      weekly_hours: weeklyHours,
      lifetime_earnings: lifetimeEarnings,
      weekly_earnings: weeklyEarnings,
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
    const { id } = params;
    const { status } = await req.json(); // Get the new status from the request body

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Implement check to prevent updating for "Coffee Panda" rank
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .maybeSingle();

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
      .maybeSingle(); // Fetch the updated employee data

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