import { supabase } from "@/lib/supabase";  // Ensure supabase is initialized properly
import { NextResponse } from "next/server";  // Use NextResponse for Next.js API routes

// API handler for POST requests
export async function POST(req: Request) {
  try {
    // Parse the incoming request data
    const body = await req.json();
    const { employee_id, hours, minutes } = body;

    // Step 1: Ensure all necessary data is present
    if (!employee_id || hours === undefined || minutes === undefined) {
      return NextResponse.json(
        { error: "Missing employee id, hours, or minutes" },
        { status: 400 }
      );
    }

    // Step 2: Calculate the total minutes to be added
    const addedMinutes = (Number(hours) * 60) + Number(minutes);

    // Step 3: Fetch employee data from the database
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("worked_minutes, paid_hours, lifetime_hours, lifetime_earnings, rank_id, weekly_hours, weekly_minutes, weekly_earnings")
      .eq("id", employee_id)
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { error: empError?.message || "Employee not found" },
        { status: 500 }
      );
    }

    // Step 4: Calculate total minutes worked and update the employee data
    const totalMinutes = (employee.worked_minutes ?? 0) + addedMinutes;
    const lifetimeHours = (employee.lifetime_hours ?? 0) + Math.floor(totalMinutes / 60);

    // Step 5: Calculate new paid hours
    const newPaidHours = Math.floor(totalMinutes / 60);

    // Step 6: Calculate weekly minutes and hours
    const newWeeklyMinutes = (employee.weekly_minutes ?? 0) + addedMinutes;
    const newWeeklyHours = Math.floor(newWeeklyMinutes / 60);  // Weekly hours should be calculated from weekly minutes

    // Step 7: Fetch the employee's wage from their rank
    const { data: rank, error: rankError } = await supabase
      .from("employee_ranks")
      .select("wage")
      .eq("id", employee.rank_id)
      .single();

    if (rankError || !rank) {
      return NextResponse.json(
        { error: rankError?.message || "Rank not found" },
        { status: 500 }
      );
    }

    const wage = rank?.wage ?? 0;

    // Step 8: Calculate earnings based on paid hours and wage
    const earnings = newPaidHours * wage;

    // Step 9: Calculate lifetime earnings (based on lifetime hours)
    const lifetimeEarnings = lifetimeHours * wage;

    // Step 10: Calculate weekly earnings (based on weekly hours)
    const weeklyEarnings = newWeeklyHours * wage;

    // Step 11: Update the employee with new worked minutes, paid hours, weekly stats, lifetime stats
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        worked_minutes: totalMinutes,
        paid_hours: newPaidHours,
        weekly_minutes: newWeeklyMinutes,
        weekly_hours: newWeeklyHours,
        weekly_earnings: weeklyEarnings,  // Update weekly earnings
        lifetime_hours: lifetimeHours,
        lifetime_earnings: lifetimeEarnings,
      })
      .eq("id", employee_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Step 12: Return the updated data in the response
    return NextResponse.json({
      success: true,
      total_minutes: totalMinutes,
      paid_hours: newPaidHours,
      weekly_minutes: newWeeklyMinutes,
      weekly_hours: newWeeklyHours,
      weekly_earnings: weeklyEarnings,
      lifetime_hours: lifetimeHours,
      lifetime_earnings: lifetimeEarnings,
    });
  } catch (err) {
    console.error("HOURS SUBMIT ERROR:", err);
    return NextResponse.json(
      { error: "Server error submitting hours" },
      { status: 500 }
    );
  }
}