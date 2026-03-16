import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your URL and service key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Change the params to a promise of { id: string }
) {
  try {
    // Await the params promise to get the 'id'
    const { id } = await params;

    /* ======================
    GET EMPLOYEE
    ====================== */
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
        current_hours,
        lifetime_hours,
        earnings,
        lifetime_earnings,
        is_admin_employee
      `)
      .eq("id", id)
      .eq("status", "Terminated") // Ensure you're querying the terminated employee
      .single();

    // Check if employee data is found, otherwise return a 404
    if (employeeError || !employee) {
      return NextResponse.json(
        { error: "Past employee not found" },
        { status: 404 }
      );
    }

    /* ======================
    GET RANK
    ====================== */
    let rankName = "Unassigned";

    if (employee.rank_id) {
      const { data: rank, error: rankError } = await supabase
        .from("employee_ranks")
        .select("rank_name")
        .eq("id", employee.rank_id)
        .single();

      // Handle any error while fetching rank data
      if (rankError) {
        console.error("Error fetching rank:", rankError);
      }

      // Set rank name if found, otherwise default to "Unassigned"
      rankName = rank?.rank_name ?? "Unassigned";
    }

    /* ======================
    GET STRIKE HISTORY
    ====================== */
    const { data: strikes, error: strikeError } = await supabase
      .from("employee_strikes")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false });

    if (strikeError) {
      console.error("Error fetching strikes:", strikeError);
    }

    /* ======================
    RETURN DATA
    ====================== */
    return NextResponse.json({
      ...employee, // Spread employee data
      rank: rankName, // Add rank information
      strike_history: strikes ?? [], // Add strike history, default to empty array if none
    });
  } catch (err) {
    console.error("PAST EMPLOYEE LOAD ERROR:", err);

    return NextResponse.json(
      { error: "Failed loading past employee" },
      { status: 500 }
    );
  }
}