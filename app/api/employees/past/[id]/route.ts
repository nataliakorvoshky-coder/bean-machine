import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop()?.trim();

    console.log("✅ ID:", id);

    if (!id || id === "past") {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      );
    }

    /* 🔥 SAFE QUERY */
    const { data: employeeList, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id);

    const employee = employeeList?.[0];

    if (error || !employee) {
      console.error("❌ NOT FOUND:", id);
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    /* ========================= */
    /* GET STRIKE HISTORY        */
    /* ========================= */
    const { data: strikes } = await supabase
      .from("employee_strikes")
      .select(`
        id,
        reason,
        number,
        created_at
      `)
      .eq("employee_id", id)
      .order("created_at", { ascending: false });

    /* ========================= */
    /* TERMINATION HISTORY       */
    /* ========================= */
    const { data: history } = await supabase
      .from("termination_history")
      .select("termination_date, rehire_status, reason")
      .eq("employee_id", id)
      .order("termination_date", { ascending: false });

    const latest = history?.[0];

    return NextResponse.json({
      ...employee,

      termination_date: latest?.termination_date
        ? new Date(latest.termination_date).toLocaleDateString()
        : "N/A",

      rehire_status:
        latest?.rehire_status === true ||
        latest?.rehire_status === "Eligible"
          ? "Eligible"
          : "Ineligible",

      termination_history: history ?? [],
      strike_history: strikes ?? [],
    });

  } catch (err) {
    console.error("Error fetching employee:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}