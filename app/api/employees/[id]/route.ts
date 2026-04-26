import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

/* ============================== */
/* GET EMPLOYEE                   */
/* ============================== */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServer();
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
  is_admin_employee,

  weekly_hours,
  weekly_minutes,
  weekly_earnings,

  lifetime_hours,
  lifetime_earnings,

  paid_minutes
`)
      .eq("id", id.trim())
      .maybeSingle();

      console.log("=== API DEBUG ===");
console.log("ID USED:", id);
console.log("EMPLOYEE RESULT:", employee);
console.log("EMPLOYEE ERROR:", employeeError);
console.log("=================");

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    /* ====================== 
    GET RANK
    ====================== */
    const { data: rank } = await supabase
      .from("employee_ranks")
      .select("rank_name, wage")
      .eq("id", employee.rank_id)
      .maybeSingle();

    const wage = rank?.wage ?? 0;

    /* ====================== 
✅ WEEKLY (FROM EMPLOYEE TABLE)
====================== */
const weeklyHours = employee.weekly_hours ?? 0;
const weeklyMinutes = employee.weekly_minutes ?? 0;
const weeklyEarnings = employee.weekly_earnings ?? 0;

/* ====================== 
🔥 REBUILD LIFETIME FROM work_hours
====================== */
const { data: workHours } = await supabase
  .from("work_hours")
  .select("hours, minutes")
  .eq("employee_id", id);

const totalMinutes =
  (workHours ?? []).reduce((sum, row) => {
    return sum + (row.hours * 60 + row.minutes);
  }, 0);

const lifetimeHours = Math.floor(totalMinutes / 60);
const lifetimeMinutes = totalMinutes % 60;

// 💰 earnings
const lifetimeEarnings = lifetimeHours * wage;

    /* ========================= */
    /* STRIKES                   */
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

    /* ========================= */
    /* TERMINATION HISTORY       */
    /* ========================= */
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
      id: employee.id,
      name: employee.name,
      status: employee.status,

      hire_date: employee.hire_date,
      phone: employee.phone,
      cid: employee.cid,
      iban: employee.iban,

      last_promotion_date: employee.last_promotion_date ?? "N/A",

      termination_date,
      termination_history: terminationHistory ?? [],

      rank: rank?.rank_name ?? "Unassigned",
      wage,

      weekly_hours: weeklyHours,
      weekly_minutes: weeklyMinutes,
      weekly_earnings: weeklyEarnings,

      lifetime_hours: lifetimeHours,
      lifetime_minutes: lifetimeMinutes,
      lifetime_earnings: lifetimeEarnings,

      paid_minutes: employee.paid_minutes ?? 0,

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
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .maybeSingle();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.rank_id === 1) {
      return NextResponse.json(
        { error: "Cannot update status for Coffee Panda rank" },
        { status: 400 }
      );
    }

const { error } = await supabase
  .from("employees")
  .update({ status })
  .eq("id", id);

if (error) {
  return NextResponse.json({ error: "Error updating status" }, { status: 500 });
}

return NextResponse.json({ success: true });

  } catch (err) {
    console.error("POST EMPLOYEE STATUS ERROR:", err);
    return NextResponse.json({ error: "Server error updating status" }, { status: 500 });
  }
}