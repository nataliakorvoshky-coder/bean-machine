import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {

    // ✅ STEP 1: get hours
    const { data: hours, error } = await supabase
      .from("work_hours")
      .select("id, hours, minutes, created_at, employee_id, submitted_by")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching hours:", error);
      return NextResponse.json({ error: "Error fetching hours log" }, { status: 500 });
    }

    if (!hours || hours.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // ✅ STEP 2: get employees
    const employeeIds = [...new Set(hours.map(h => h.employee_id))];

    const { data: employees } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds);

    // ✅ STEP 3: get profiles (NOT users)
    const userIds = [...new Set(hours.map(h => h.submitted_by))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    // ✅ STEP 4: maps
    const employeeMap: any = {};
    employees?.forEach(e => {
      employeeMap[e.id] = e.name;
    });

    const userMap: any = {};
    profiles?.forEach(u => {
      userMap[u.id] = u.username;
    });

    // ✅ STEP 5: merge
    const formatted = hours.map(h => ({
      ...h,
      employee_name: employeeMap[h.employee_id] || null,
      submitted_by_name: userMap[h.submitted_by] || null,
    }));

    return NextResponse.json(formatted, { status: 200 });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error fetching hours log" },
      { status: 500 }
    );
  }
}