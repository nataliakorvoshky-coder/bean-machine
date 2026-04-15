import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // ✅ MOVE HERE

export const dynamic = "force-dynamic";

export async function GET() {
  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: requests, error } = await supabase
      .from("requests")
      .select("*");

    console.log("FINAL REQUESTS:", requests);

    if (error) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(requests || [], { status: 200 });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}