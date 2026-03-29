import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

/* ============================== */
/* GET EMPLOYEE (WITH PAY LOGIC)  */
/* ============================== */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

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
        phone,
        cid,
        iban,
        last_promotion_date,
        is_admin_employee
      `)
      .eq("id", id)
      .maybeSingle();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    /* ====================== 
    GET ALL HOURS (LIFETIME)
    ====================== */
    const { data: hoursData, error: hoursError } = await supabase
      .from("work_hours")
      .select("hours, minutes, created_at")
      .eq("employee_id", id);

    if (hoursError) {
      return NextResponse.json({ error: "Error fetching work hours" }, { status: 500 });
    }

    /* ====================== 
    🔥 LIFETIME MINUTES
    ====================== */
    const totalMinutes = (hoursData || []).reduce((acc, entry) => {
      return acc + ((entry.hours || 0) * 60) + (entry.minutes || 0);
    }, 0);

    /* ====================== 
    🔥 30-MIN RULE
    ====================== */
    const lifetimeBlocks = Math.floor(totalMinutes / 30);
    const lifetimeHours = lifetimeBlocks * 0.5;

    /* ====================== 
    🔥 WEEKLY CALCULATION
    ====================== */
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyMinutes = (hoursData || []).reduce((acc, entry) => {
      const entryDate = new Date(entry.created_at);

      if (entryDate >= oneWeekAgo) {
        return acc + ((entry.hours || 0) * 60) + (entry.minutes || 0);
      }

      return acc;
    }, 0);

    const weeklyBlocks = Math.floor(weeklyMinutes / 30);
    const weeklyHours = weeklyBlocks * 0.5;

    /* ====================== 
    GET RANK
    ====================== */
    const { data: rank, error: rankError } = await supabase
      .from("employee_ranks")
      .select("rank_name, wage")
      .eq("id", employee.rank_id)
      .maybeSingle();

    if (rankError || !rank) {
      return NextResponse.json({ error: "Rank not found" }, { status: 404 });
    }

    const wage = rank?.wage ?? 0;

    /* ====================== 
    💰 EARNINGS
    ====================== */
    const weeklyEarnings = weeklyHours * wage;
    const lifetimeEarnings = lifetimeHours * wage;

    /* ========================= */
/* GET STRIKE HISTORY        */
/* ========================= */
const { data: strikes } = await supabase
  .from("employee_strikes")
  .select(`
    id,
    reason,
    number,
    created_at
  `)
  .eq("employee_id", id)
  .order("created_at", { ascending: false });

/* ====================== 
🔥 TERMINATION HISTORY (FIXED)
====================== */
const { data: terminationHistory } = await supabase
  .from("termination_history")
  .select(`
    id,
    termination_date,
    reason,
    rehire_status
  `)
  .eq("employee_id", id)
  .order("termination_date", { ascending: false });

const latest = terminationHistory?.[0];

const termination_date = latest?.termination_date
  ? new Date(latest.termination_date).toLocaleDateString()
  : "N/A";

    /* ====================== 
    RESPONSE
    ====================== */
return NextResponse.json({
  ...employee,

  termination_date,
  termination_history: terminationHistory ?? [], // 🔥 THIS IS WHY PANEL WAS EMPTY

  rank: rank?.rank_name ?? "Unassigned",
  wage,

  lifetime_hours: lifetimeHours,
  weekly_hours: weeklyHours,

  lifetime_earnings: lifetimeEarnings,
  weekly_earnings: weeklyEarnings,

  strike_history: strikes ?? [],
});
  } catch (err) {
    console.error("Error fetching employee:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ============================== */
/* UPDATE STATUS                  */
/* ============================== */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .maybeSingle();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.rank_id === 1) {
      return NextResponse.json(
        { error: "Cannot update status for Coffee Panda rank" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Error updating status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_employee: data });

  } catch (err) {
    console.error("POST EMPLOYEE STATUS ERROR:", err);
    return NextResponse.json({ error: "Server error updating status" }, { status: 500 });
  }
}