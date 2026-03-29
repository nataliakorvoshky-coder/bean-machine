import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const supabase = getSupabaseServer();

export async function POST(req: Request) {
  const { request_id, manager } = await req.json();

  await supabase
    .from("request_presence")
    .upsert(
      {
        request_id,
        manager,
        last_active: new Date().toISOString(),
      },
      { onConflict: "request_id,manager" }
    );

  return NextResponse.json({ success: true });
}