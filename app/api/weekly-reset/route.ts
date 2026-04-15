import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = getSupabaseServer();

    console.log("🔄 Starting weekly reset...");

const { data, error } = await supabase
  .from("employees")
.update({
  weekly_hours: 0,
  weekly_minutes: 0,
  weekly_earnings: 0,
  worked_minutes: 0,
  paid_hours: 0,
})
.not("id", "is", null) // ✅ REQUIRED WHERE CLAUSE
.select("id");

    if (error) {
      console.error("❌ Reset failed:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Reset completed for ${data?.length || 0} employees`);

    return NextResponse.json({
      success: true,
      resetCount: data?.length || 0,
      message: "Weekly stats reset successfully",
    });

  } catch (err: any) {
    console.error("❌ SERVER ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Server error during reset" },
      { status: 500 }
    );
  }
}