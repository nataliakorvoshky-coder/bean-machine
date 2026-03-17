import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Ensure the correct import path

// GET method to fetch basic employee details for the overview page
export async function GET() {
  try {
    // Fetch employee details along with rank info
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        status,
        rank_id,
        weekly_hours, 
        last_promotion_date,  
        employee_ranks:rank_id (
          rank_name,
          wage,
          hours_required
        )
      `)
      .order("name");

    // Handle any errors while fetching employee data
    if (error) {
      console.error("EMPLOYEES API ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch most recent termination date from the termination_history table
    const { data: terminationHistory, error: terminationError } = await supabase
      .from("termination_history")
      .select("termination_date")
      .in("employee_id", data.map((emp: any) => emp.id)) // Fetch termination dates for all employees
      .order("termination_date", { ascending: false })
      .limit(1); // We assume that the latest termination date is relevant for the employee

    if (terminationError) {
      console.error("Error fetching termination history:", terminationError);
      return NextResponse.json({ error: terminationError.message }, { status: 500 });
    }

    // Format the data to include only the necessary information
    const formatted = (data || []).map((emp: any) => {
      // Check if the employee's weekly hours meet the goal (compared with rank's required hours)
      const meetsGoal = emp.weekly_hours >= (emp.employee_ranks?.hours_required ?? 0);

      // Conditionally remove termination date for rehired employees
      const terminationDate = emp.status === "Terminated"
        ? new Date(terminationHistory[0]?.termination_date).toLocaleDateString() // Use the most recent termination date
        : "N/A";

      return {
        id: emp.id,
        name: emp.name,
        status: emp.status,
        rank: emp.employee_ranks?.rank_name ?? "-",  // Default to "-" if rank is null
        wage: emp.employee_ranks?.wage ?? 0,  // Default to 0 if wage is null
        earnings: emp.weekly_earnings ?? 0,  // Assuming weekly_earnings is already calculated in the DB
        last_promotion_date: emp.last_promotion_date ?? "N/A",  // Default to "N/A" if last_promotion_date is null
        termination_date: terminationDate, // Set termination date from the termination_history table
        goal_met: meetsGoal,  // Set goal_met based on the comparison of hours
      };
    });

    // Return the formatted employee data
    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET EMPLOYEES API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST method to create a new employee
export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const { name, rank_id, hire_date, last_promotion_date, phone, cid, iban } = await req.json();

    // Validate if any fields are missing
    if (!name || !rank_id || !hire_date || !phone || !cid || !iban || !last_promotion_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Default status for new employees
    const status = "Active";  // Assuming new employees are always active

    // Insert employee into the employees table
    const { data, error } = await supabase.from("employees").insert([{
      name,
      rank_id,
      hire_date,
      last_promotion_date, // Include the last promotion date in the insert
      phone,
      cid,
      iban,
      status,  // Set the default status
    }]).select(); // Explicitly request data after insertion

    // Check for errors in inserting employee data
    if (error) {
      console.error("Error inserting employee:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure that employee data is returned
    if (!data || data.length === 0) {
      console.error("No employee data returned after insert");
      return NextResponse.json({ error: "Failed to create employee. No data returned." }, { status: 500 });
    }

    console.log("Employee created successfully:", data);

    // Return the newly created employee data
    return NextResponse.json({ success: true, employee: data[0] }, { status: 201 });
  } catch (err) {
    console.error("Error during employee creation:", err);
    return NextResponse.json({ error: "Server error during employee creation" }, { status: 500 });
  }
}