import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    /* ======================
    GET TERMINATED EMPLOYEES + HISTORY
    ====================== */
    const { data: employees, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        hire_date,
        rank_id,
        termination_history (
          termination_date,
          rehire_status
        )
      `)
      .eq("status", "Terminated")
      .order("hire_date", { ascending: false });

    if (error) throw error;

    if (!employees || employees.length === 0) {
      return NextResponse.json([]);
    }

    /* ======================
    GET STRIKES
    ====================== */
    const { data: strikes } = await supabase
      .from("employee_strikes")
      .select("employee_id");

    const strikeMap: Record<string, number> = {};
    strikes?.forEach((s: any) => {
      strikeMap[s.employee_id] = (strikeMap[s.employee_id] ?? 0) + 1;
    });

    /* ======================
    GET RANKS
    ====================== */
    const { data: ranks } = await supabase
      .from("employee_ranks")
      .select("id, rank_name")
      .in("id", employees.map((e: any) => e.rank_id));

    const rankMap: Record<string, string> = {};
    ranks?.forEach((r: any) => {
      rankMap[r.id] = r.rank_name;
    });

    const formatted = employees.map((emp: any) => {
      const latest = emp.termination_history
        ?.sort(
          (a: any, b: any) =>
            new Date(b.termination_date).getTime() -
            new Date(a.termination_date).getTime()
        )[0];

      const eligible = latest?.rehire_status ?? false;

      return {
        id: emp.id,
        name: emp.name,
        hire_date: emp.hire_date
          ? new Date(emp.hire_date).toLocaleDateString()
          : "N/A",
        rank: rankMap[emp.rank_id] ?? "N/A",
        strikes: strikeMap[emp.id] ?? 0,
        termination_date: latest?.termination_date ?? null,
        rehire_eligible: eligible,
        rehire_status: eligible ? "Eligible" : "Ineligible",
      };
    });

    return NextResponse.json(formatted);

  } catch (err) {
    console.error("PAST EMPLOYEES ERROR:", err);
    return NextResponse.json(
      { error: "Failed loading past employees" },
      { status: 500 }
    );
  }
}