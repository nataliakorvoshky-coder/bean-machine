import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseServer();
  const { id } = await params;

  const { timezone } = await req.json();

  // 🔍 Get current timezone from DB
  const { data: employee } = await supabase
    .from("employees")
    .select("timezone")
    .eq("id", id)
    .single();

  // ✅ ONLY update if different
  if (employee?.timezone !== timezone) {
    await supabase
      .from("employees")
      .update({ timezone })
      .eq("id", id);

    console.log("🌍 Timezone updated:", timezone);
  } else {
    console.log("🌍 Timezone already correct");
  }

  return NextResponse.json({ success: true });
}