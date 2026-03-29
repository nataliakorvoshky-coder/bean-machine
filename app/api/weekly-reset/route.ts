import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    /* ============================== */
    /* 🔥 RESET WEEKLY DATA           */
    /* ============================== */
    const { error } = await supabase
      .from("employees")
      .update({
        weekly_hours: 0,
        weekly_minutes: 0,
        weekly_earnings: 0,
      })
      .neq("id", ""); // updates all rows

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* ✅ SUCCESS                     */
    /* ============================== */
    return NextResponse.json({
      success: true,
      message: "Weekly stats reset successfully",
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error during reset" },
      { status: 500 }
    );
  }
}