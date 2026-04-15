import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🔥 INCOMING BODY:", body);

    const { employee_id, hours, minutes, work_date, submitted_by } = body;

    if (
      !employee_id ||
      hours === undefined ||
      minutes === undefined ||
      !work_date ||
      !submitted_by
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ============================== */
    /* 🧾 INSERT SHIFT                */
    /* ============================== */
    const { error: insertError } = await supabase
      .from("work_hours")
      .insert([
        {
          employee_id,
          hours: Number(hours),
          minutes: Number(minutes),
          work_date,
          submitted_by,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("❌ INSERT ERROR:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* 🔥 ONLY USE NEW SHIFT          */
    /* ============================== */
    const addedMinutes = (Number(hours) * 60) + Number(minutes);

    console.log("🧠 ADDED MINUTES:", addedMinutes);

    /* ============================== */
    /* 💰 GET EMPLOYEE + RANK         */
    /* ============================== */
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select(`
        id,
        rank_id,
        weekly_hours,
        weekly_minutes,
        weekly_earnings,
        lifetime_hours,
        lifetime_minutes,
        lifetime_earnings
      `)
      .eq("id", employee_id)
      .single();

    if (empError || !employee) {
      console.error("❌ EMPLOYEE ERROR:", empError);
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const { data: rank, error: rankError } = await supabase
      .from("employee_ranks")
      .select("wage")
      .eq("id", employee.rank_id)
      .single();

    if (rankError) {
      console.error("❌ RANK ERROR:", rankError);
      return NextResponse.json(
        { error: rankError.message },
        { status: 500 }
      );
    }

    const wage = Number(rank?.wage || 0);

    /* ============================== */
    /* 🔥 BUILD WEEKLY TOTALS         */
    /* ============================== */
    const currentWeeklyMinutes =
      (employee.weekly_hours ?? 0) * 60 +
      (employee.weekly_minutes ?? 0);

    const newWeeklyTotal = currentWeeklyMinutes + addedMinutes;

    const paidMinutes = Math.floor(newWeeklyTotal / 30) * 30;
    const paidHours = paidMinutes / 60;

    const weeklyHours = Math.floor(newWeeklyTotal / 60);
    const weeklyMinutes = newWeeklyTotal % 60;

    const earnings = paidHours * wage;

    /* ============================== */
    /* 🔥 BUILD LIFETIME TOTALS       */
    /* ============================== */
    const prevLifetimeMinutes =
      (employee.lifetime_hours ?? 0) * 60 +
      (employee.lifetime_minutes ?? 0);

    const newLifetimeTotal = prevLifetimeMinutes + addedMinutes;

    const newLifetimeHours = Math.floor(newLifetimeTotal / 60);
    const newLifetimeMinutes = newLifetimeTotal % 60;

    /* ============================== */
    /* 🔥 UPDATE EMPLOYEE             */
    /* ============================== */
    const { data: updatedRow, error: updateError } = await supabase
      .from("employees")
      .update({
        worked_minutes: newWeeklyTotal,
        paid_hours: paidHours,

        weekly_hours: weeklyHours,
        weekly_minutes: weeklyMinutes,
        weekly_earnings: earnings,

        lifetime_hours: newLifetimeHours,
        lifetime_minutes: newLifetimeMinutes,
        lifetime_earnings:
          (employee.lifetime_earnings ?? 0) + earnings,
      })
      .eq("id", employee_id)
      .select();

    console.log("✅ UPDATED ROW:", updatedRow);
    console.log("❌ UPDATE ERROR:", updateError);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* ✅ SUCCESS                     */
    /* ============================== */
    return NextResponse.json({
      success: true,
      weeklyMinutes: newWeeklyTotal,
      paidMinutes,
      paidHours,
      wage,
      earnings,
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error submitting hours" },
      { status: 500 }
    );
  }
}