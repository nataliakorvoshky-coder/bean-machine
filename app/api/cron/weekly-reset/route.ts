import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force");

  const supabase = getSupabaseServer();

  const now = new Date();

  const day = now.getUTCDay();   // use UTC (stable)
  const hour = now.getUTCHours();

  const today = now.toISOString().split("T")[0];

  // 🔥 FLEXIBLE WINDOW
  const shouldReset =
    force === "true" ||
    (day === 0 && hour < 3); // Sunday 00:00–03:00 UTC

  if (!shouldReset) {
    return NextResponse.json({ success: false, skipped: true });
  }

    // 🔥 GET CURRENT WEEKLY DATA BEFORE RESET
  const { data: employees, error: fetchError } = await supabase
    .from("employees")
    .select(`
      id,
      name,
      weekly_minutes,
      weekly_hours,
      weekly_earnings
    `)

  if (fetchError) {
    console.error("❌ Employee fetch failed:", fetchError.message)

    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    )
  }

    // 🔥 SAVE WEEKLY SNAPSHOTS
  if (employees?.length) {

    const snapshots = employees.map(emp => ({
      employee_id: emp.id,
      employee_name: emp.name,
      total_minutes: emp.weekly_minutes || 0,
      total_hours: emp.weekly_hours || 0,
      total_earnings: emp.weekly_earnings || 0,
      snapshot_type: "weekly",
      snapshot_date: today,
      created_at: new Date().toISOString(),
    }))

    const { error: snapshotError } = await supabase
      .from("employee_snapshots")
      .insert(snapshots)

    if (snapshotError) {
      console.error("❌ Snapshot save failed:", snapshotError.message)

      return NextResponse.json(
        { error: snapshotError.message },
        { status: 500 }
      )
    }

    console.log("✅ Weekly snapshots saved")
  }

  // 🔥 SINGLE BULK UPDATE (FAST + SAFE)
  const { error } = await supabase
    .from("employees")
    .update({
      weekly_hours: 0,
      weekly_minutes: 0,
      weekly_earnings: 0,
      worked_minutes: 0,
      paid_hours: 0,
      goal_exempt: false,
      last_reset_date: today,
    })
    .not("id", "is", null); // required

  if (error) {
    console.error("❌ Reset failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("✅ Weekly reset completed");

  return NextResponse.json({
    success: true,
    message: "Weekly reset completed",
  });
}