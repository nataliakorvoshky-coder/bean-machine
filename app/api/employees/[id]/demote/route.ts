import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Demote employee logic
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Unwrap the Promise from params
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Get employee rank
    const { data: employee, error } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get rank info and ensure the rank is not "Coffee Panda"
    const { data: rank } = await supabase
      .from("employee_ranks")
      .select("rank_name, rank_level")
      .eq("id", employee.rank_id)
      .maybeSingle();

    if (rank?.rank_name === "Coffee Panda") {
      return NextResponse.json({
        success: false,
        message: "This rank cannot be demoted",
      });
    }

    // Demotion logic using rank_level
    const currentRankLevel = rank?.rank_level;

    // Fetch the previous rank with a lower rank_level
    const { data: prevRank } = await supabase
      .from("employee_ranks")
      .select("id, rank_name, wage, rank_level")
      .lt("rank_level", currentRankLevel)  // Get previous rank (lower rank_level)
      .order("rank_level", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!prevRank) {
      return NextResponse.json({ success: false, message: "Employee already at lowest rank" });
    }

    // Update employee's rank to previous rank
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        rank_id: prevRank.id,
        last_promotion_date: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rank: prevRank.rank_name,
      wage: prevRank.wage,
      rank_id: prevRank.id,
      last_promotion_date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Demote error:", err);
    return NextResponse.json({ error: "Error demoting employee" }, { status: 500 });
  }
}