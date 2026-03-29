import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔥 TERMINATE API HIT");

    const { id } = await params;
const body = await req.json();

const { termination_date, rehire_status, reason } = body;

console.log("📦 BODY:", body);

    if (!termination_date || rehire_status === undefined) {
      return NextResponse.json(
        { error: "Termination date and rehire status required" },
        { status: 400 }
      );
    }

    /* ============================== */
    /* 🔍 GET EMPLOYEE                */
    /* ============================== */
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, rank_id")
      .eq("id", id)
      .maybeSingle();

    if (empError || !employee) {
      console.error("Employee fetch error:", empError);
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    /* ============================== */
    /* 🔥 UPDATE EMPLOYEE             */
    /* ============================== */
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        status: "Terminated",
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* 🔥 INSERT TERMINATION HISTORY  */
    /* ============================== */
    console.log("📦 inserting termination history...");

const { data: insertData, error: insertError } = await supabase
  .from("termination_history")
.insert([
  {
    employee_id: id,
    termination_date,
    rehire_status, // ✅ CORRECT PLACE
    reason,
    rank_at_termination: employee.rank_id,
    created_at: new Date().toISOString(),
  },
])
  .select();

    console.log("INSERT DATA:", insertData);
    console.log("INSERT ERROR:", insertError);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ============================== */
    /* ✅ SUCCESS                     */
    /* ============================== */
    return NextResponse.json({
      success: true,
      message: "Employee terminated + history saved",
      termination: insertData,
    });

  } catch (err) {
    console.error("Termination error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}