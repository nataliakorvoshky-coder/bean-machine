import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    /* ============================== */
    /* 🔍 VERIFY EMPLOYEE             */
    /* ============================== */
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (empError || !employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    /* ============================== */
    /* 🔥 REHIRE (ONLY STATUS)        */
    /* ============================== */
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        status: "Active", // ✅ ONLY THIS
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* 🔄 OPTIONAL: MARK HISTORY      */
    /* ============================== */
    const { data: history } = await supabase
      .from("termination_history")
      .select("id")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (history) {
      await supabase
        .from("termination_history")
        .update({
          rehired_at: new Date().toISOString(), // optional
        })
        .eq("id", history.id);
    }

    /* ============================== */
    /* ✅ SUCCESS                     */
    /* ============================== */
    return NextResponse.json({
      success: true,
      message: "Employee re-hired successfully",
    });

  } catch (err) {
    console.error("Rehire error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}