import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const supabase = getSupabaseServer();

export async function GET() {
  const cutoff = new Date(Date.now() - 15000).toISOString(); // 15s

  const { data } = await supabase
    .from("request_presence")
    .select("*")
    .gt("last_active", cutoff);

  return NextResponse.json(data || []);
}