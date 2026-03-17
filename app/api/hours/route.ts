import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: hours, error } = await supabase
      .from("employee_hours") // Assuming this is the table where hours are stored
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(hours);
  } catch (err) {
    console.error("Error fetching hours data:", err);
    return NextResponse.json({ error: "Failed to fetch hours" }, { status: 500 });
  }
}