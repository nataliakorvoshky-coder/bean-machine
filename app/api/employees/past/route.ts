import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your URL and service key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    /* ======================
    GET TERMINATED EMPLOYEES
    ====================== */
    const { data: employees, error: employeeError } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        hire_date,
        rank_id
      `)
      .eq("status", "Terminated") // You still fetch only terminated employees
      .order("hire_date", { ascending: false });

    if (employeeError) {
      console.error("Error fetching employees:", employeeError);
      throw employeeError;
    }

    if (!employees || employees.length === 0) {
      console.log("No terminated employees found.");
      return NextResponse.json([]); // Return an empty array if no terminated employees are found
    }

    /* ======================
    GET MOST RECENT REHIRE STATUS FROM TERMINATION_HISTORY
    ====================== */
    const { data: terminationHistory, error: terminationError } = await supabase
      .from("termination_history")
      .select("employee_id, rehire_status") // Select rehire status instead of termination date
      .in("employee_id", employees.map((emp: any) => emp.id)) // Get termination history for all employees
      .order("termination_date", { ascending: false });

    if (terminationError) {
      console.error("Error fetching termination history:", terminationError);
      throw terminationError;
    }

    // Map the most recent rehire_status to each employee
    const rehireStatusMap: Record<string, string> = {};
    terminationHistory.forEach((termination: any) => {
      rehireStatusMap[termination.employee_id] = termination.rehire_status || "N/A";
    });

    /* ======================
    GET STRIKE COUNTS
    ====================== */
    const { data: strikes, error: strikeError } = await supabase
      .from("employee_strikes")
      .select("employee_id");

    if (strikeError) {
      console.error("Error fetching strikes:", strikeError);
      throw strikeError;
    }

    // Map employee strikes count
    const strikeMap: Record<string, number> = {};
    strikes?.forEach((s: any) => {
      strikeMap[s.employee_id] = (strikeMap[s.employee_id] ?? 0) + 1;
    });

    /* ======================
    GET RANK DETAILS
    ====================== */
    const { data: ranks, error: rankError } = await supabase
      .from("employee_ranks")
      .select("id, rank_name")
      .in("id", employees.map((emp: any) => emp.rank_id));

    if (rankError) {
      console.error("Error fetching ranks:", rankError);
      throw rankError;
    }

    const rankMap = ranks?.reduce((map: any, rank: any) => {
      map[rank.id] = rank.rank_name;
      return map;
    }, {});

    /* ======================
    FORMAT RESPONSE
    ====================== */
    const formatted = employees?.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      rehire_status: rehireStatusMap[emp.id] ?? "N/A", // Get rehire status from the map
      hire_date: emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : "N/A",
      strikes: strikeMap[emp.id] ?? 0,
      rank: rankMap[emp.rank_id] ?? "N/A",
    }));

    console.log("Formatted Employees:", formatted);

    return NextResponse.json(formatted ?? []); // Return empty array if no data available
  } catch (err) {
    console.error("PAST EMPLOYEES ERROR:", err);
    return NextResponse.json(
      { error: "Failed loading past employees" },
      { status: 500 }
    );
  }
}