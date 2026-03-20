import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(req: Request) {
  try {
    const { id, employee_id, hours, minutes } = await req.json();

    if (!id || !employee_id || hours === undefined || minutes === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Delete the specific entry from the work_hours table
    const { error: deleteError } = await supabase
      .from("work_hours")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting hours log entry:", deleteError);
      return NextResponse.json({ error: "Error deleting entry" }, { status: 500 });
    }

    // Update the employee's data to remove the deleted hours from totals
    await updateEmployeeData(employee_id, hours, minutes);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("Error deleting hours log entry:", err);
    return NextResponse.json({ error: "Server error deleting entry" }, { status: 500 });
  }
}

async function updateEmployeeData(employee_id: string, hours: number, minutes: number) {
  // Fetch current employee data
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employee_id)
    .maybeSingle();

  if (error || !employee) {
    console.error("Employee not found:", error);
    return;
  }

  // Calculate the minutes to remove
  const totalMinutesToRemove = hours * 60 + minutes;
  const newWorkedMinutes = Math.max((employee.worked_minutes || 0) - totalMinutesToRemove, 0);
  const newPaidHours = Math.max(Math.floor(newWorkedMinutes / 60), 0);
  const newWeeklyMinutes = Math.max((employee.weekly_minutes || 0) - totalMinutesToRemove, 0);
  const newWeeklyHours = Math.max(Math.floor(newWeeklyMinutes / 60), 0);
  const newLifetimeHours = Math.max((employee.lifetime_hours || 0) - Math.floor(newWorkedMinutes / 60), 0);
  const wage = employee.wage || 0;
  const newWeeklyEarnings = newWeeklyHours * wage;
  const newLifetimeEarnings = newLifetimeHours * wage;

  // Update the employee data with the new values
  const { error: updateError } = await supabase
    .from("employees")
    .update({
      worked_minutes: newWorkedMinutes,
      paid_hours: newPaidHours,
      weekly_minutes: newWeeklyMinutes,
      weekly_hours: newWeeklyHours,
      weekly_earnings: newWeeklyEarnings,
      lifetime_hours: newLifetimeHours,
      lifetime_earnings: newLifetimeEarnings,
    })
    .eq("id", employee_id);

  if (updateError) {
    console.error("Error updating employee data:", updateError);
  }
}