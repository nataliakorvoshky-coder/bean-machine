import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* ============================== */
/* 📌 GET EMPLOYEES               */
/* ============================== */
export async function GET() {
  try {
    /* ============================== */
    /* 🔥 FETCH EMPLOYEES + RANK      */
    /* ============================== */
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        status,
        rank_id,
        weekly_hours,
        weekly_minutes,
        weekly_earnings,
        last_promotion_date,
        employee_ranks:rank_id (
          rank_name,
          wage,
          hours_required
        )
      `)
      .order("name");

    if (error) {
      console.error("EMPLOYEES API ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    /* ============================== */
    /* 🔥 FETCH ALL TERMINATIONS      */
    /* ============================== */
    const { data: termData, error: termError } = await supabase
      .from("termination_history")
      .select("employee_id, termination_date");

    if (termError) {
      console.error("TERMINATION FETCH ERROR:", termError);
    }

    /* ============================== */
    /* 🔥 MAP LATEST TERMINATION      */
    /* ============================== */
    const terminationMap: Record<string, string> = {};

    (termData || []).forEach((t: any) => {
      const existing = terminationMap[t.employee_id];

      if (!existing || new Date(t.termination_date) > new Date(existing)) {
        terminationMap[t.employee_id] = t.termination_date;
      }
    });

    /* ============================== */
    /* 🔥 FORMAT FOR FRONTEND         */
    /* ============================== */
    const formatted = (data || []).map((emp: any) => {
      const weeklyHours = emp.weekly_hours ?? 0;
      const requiredHours = emp.employee_ranks?.hours_required ?? 0;

      return {
        id: emp.id,
        name: emp.name,
        status: emp.status,

        rank: emp.employee_ranks?.rank_name ?? "-",
        wage: emp.employee_ranks?.wage ?? 0,

        /* ✅ FIXED FIELDS */
        hours: weeklyHours,
        minutes: emp.weekly_minutes ?? 0,
        earnings: emp.weekly_earnings ?? 0,

        /* ✅ FIXED GOAL LOGIC */
        goal_met: weeklyHours >= requiredHours,

        last_promotion_date: emp.last_promotion_date ?? "N/A",

        /* ✅ FIXED TERMINATION PER EMPLOYEE */
        termination_date:
          emp.status === "Terminated" && terminationMap[emp.id]
            ? new Date(terminationMap[emp.id]).toLocaleDateString()
            : "N/A",
      };
    });

    return NextResponse.json(formatted);

  } catch (err) {
    console.error("GET EMPLOYEES API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ============================== */
/* 📌 CREATE EMPLOYEE             */
/* ============================== */
export async function POST(req: Request) {
  try {
    const {
      name,
      rank_id,
      hire_date,
      last_promotion_date,
      phone,
      cid,
      iban
    } = await req.json();

    if (!name || !rank_id || !hire_date || !phone || !cid || !iban || !last_promotion_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const status = "Active";

    const { data, error } = await supabase
      .from("employees")
      .insert([{
        name,
        rank_id,
        hire_date,
        last_promotion_date,
        phone,
        cid,
        iban,
        status,
      }])
      .select();

    if (error) {
      console.error("Error inserting employee:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No employee returned" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      employee: data[0]
    }, { status: 201 });

  } catch (err) {
    console.error("Error during employee creation:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}