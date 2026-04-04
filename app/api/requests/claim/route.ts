import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = getSupabaseServer();

  try {
    const { requestId, userId } = await req.json();

    if (!requestId || !userId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("requests")
      .update({
        status: "Claimed",
        claimed_by: userId
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}