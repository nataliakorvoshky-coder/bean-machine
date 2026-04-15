import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseServer();
  const { id } = await params;

  const { timezone } = await req.json();

  await supabase
    .from("employees")
    .update({ timezone })
    .eq("id", id);

  return NextResponse.json({ success: true });
}