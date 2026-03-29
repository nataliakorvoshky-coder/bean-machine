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
    /* 🔥 REBUILD TOTALS              */
    /* ============================== */
    const { data: allHours, error: hoursError } = await supabase
      .from("work_hours")
      .select("hours, minutes")
      .eq("employee_id", employee_id);

    if (hoursError) {
      console.error("❌ HOURS FETCH ERROR:", hoursError);
      return NextResponse.json(
        { error: hoursError.message },
        { status: 500 }
      );
    }

    const totalMinutes = (allHours || []).reduce((acc, row) => {
      return acc + (Number(row.hours) * 60 + Number(row.minutes));
    }, 0);

    console.log("🧠 TOTAL MINUTES:", totalMinutes);

    /* ============================== */
    /* 🔥 APPLY 30 MIN RULE           */
    /* ============================== */
    const paidMinutes = Math.floor(totalMinutes / 30) * 30;
    const paidHours = paidMinutes / 60;

    console.log("🧠 PAID:", { paidMinutes, paidHours });

    /* ============================== */
    /* 💰 GET EMPLOYEE + RANK         */
    /* ============================== */
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, rank_id")
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
    /* 💰 CALCULATE EARNINGS          */
    /* ============================== */
    const earnings = paidHours * wage;

    console.log("💰 EARNINGS:", earnings);

    /* ============================== */
    /* 🔥 UPDATE EMPLOYEE (DEBUG)     */
    /* ============================== */
    const { data: updatedRow, error: updateError } = await supabase
      .from("employees")
      .update({
        worked_minutes: totalMinutes,
        paid_hours: paidHours,

        weekly_hours: paidHours,
        weekly_minutes: paidMinutes,
        weekly_earnings: earnings,

        lifetime_hours: paidHours,
        lifetime_minutes: paidMinutes,
        lifetime_earnings: earnings,
      })
      .eq("id", employee_id)
      .select(); // ✅ CRITICAL

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
      totalMinutes,
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