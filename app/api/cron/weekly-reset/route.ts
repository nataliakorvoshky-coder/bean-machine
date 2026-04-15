import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = getSupabaseServer();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, timezone, last_reset_date");

  const now = new Date();

  for (const emp of employees ?? []) {
    const tz = emp.timezone || "UTC";

    const local = new Date(
      now.toLocaleString("en-US", { timeZone: tz })
    );

    const day = local.getDay(); // Sunday = 0
    const hour = local.getHours();

    const today = local.toISOString().split("T")[0];

    if (day === 0 && hour === 0 && emp.last_reset_date !== today) {
      await supabase
        .from("employees")
        .update({
          weekly_hours: 0,
          weekly_minutes: 0,
          weekly_earnings: 0,
          worked_minutes: 0,
          paid_hours: 0,
          last_reset_date: today,
        })
        .eq("id", emp.id);

      console.log(`✅ Reset ${emp.id} (${tz})`);
    }
  }

  return NextResponse.json({ success: true });
}