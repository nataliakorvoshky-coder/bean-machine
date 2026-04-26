import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/* ========================= */
/* ✅ GET (for pages)        */
/* ========================= */
export async function GET() {
  const supabase = getSupabaseServer(); // ✅ moved here

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

/* ========================= */
/* ✅ POST (submit request)  */
/* ========================= */
console.log("🔥 REQUEST HIT");

export async function POST(req: Request) {
  const supabase = getSupabaseServer(); // ✅ moved here

  try {
    const body = await req.json();
    const {
  type,
  reason,
  start_date,
  end_date,
  week_start,
  user_id,
} = body;

const uid = user_id || body.employee_id;

if (!uid) {
  return NextResponse.json({ error: "Missing user" }, { status: 400 });
}

    /* 👤 PROFILE */
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    /* 👤 EMPLOYEE */
    const { data: employee } = await supabase
      .from("employees")
      .select("id, name")
      .eq("id", profile.employee_id)
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 400 });
    }

    /* 📝 INSERT */
    const { data, error } = await supabase
      .from("requests")
.insert({
  type,
  reason,

  // ✅ SUPPORT BOTH TYPES
  start_date: start_date ?? null,
  end_date: end_date ?? null,
  week_start: week_start ?? null,

  status: "Pending",

  employee_id: employee.id,
  employee_name: employee.name,
})
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}