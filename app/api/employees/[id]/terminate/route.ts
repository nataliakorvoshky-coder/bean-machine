import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db"

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
const { error: updateError } = await db.update(
  "employees",
  {
    status: "Terminated",
  },
  { id },
  {
    action: `Terminated employee ${id}`,
    type: "employee"
  }
)

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

const { error: insertError } = await db.insert(
  "termination_history",
  {
    employee_id: id,
    termination_date,
    rehire_status,
    reason,
    rank_at_termination: employee.rank_id,
    created_at: new Date().toISOString(),
  }
)
   
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
      termination: {
  employee_id: id,
  termination_date,
  rehire_status,
  reason
}
    });

  } catch (err) {
    console.error("Termination error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}