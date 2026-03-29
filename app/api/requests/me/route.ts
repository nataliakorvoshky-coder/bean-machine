import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const supabase = getSupabaseServer();

export async function GET() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("AUTH ERROR:", authError);
      return NextResponse.json([], { status: 200 });
    }

    /* 👤 GET PROFILE */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("employee_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      return NextResponse.json([], { status: 200 });
    }

    if (!profile?.employee_id) {
      console.warn("⚠️ No employee linked to profile:", user.id);
      return NextResponse.json([], { status: 200 });
    }

    /* 📄 GET ONLY THEIR REQUESTS */
    const { data: requests, error } = await supabase
      .from("requests")
      .select("*")
      .eq("employee_id", profile.employee_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("REQUEST FETCH ERROR:", error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(requests || [], { status: 200 });
  } catch (err) {
    console.error("UNEXPECTED SERVER ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}