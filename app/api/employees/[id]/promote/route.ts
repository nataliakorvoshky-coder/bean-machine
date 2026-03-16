import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Use await to unwrap the promise

    if (!id) {
      return NextResponse.json(
        { error: "Missing employee id" },
        { status: 400 }
      );
    }

    // Step 1: Get current employee's rank
    const { data: employee, error } = await supabase
      .from("employees")
      .select("rank_id")
      .eq("id", id)
      .single();

    if (error || !employee) {
      console.error("EMPLOYEE FETCH ERROR:", error);
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 500 }
      );
    }

    const currentRank = employee.rank_id;

    // Step 2: Get the list of employee ranks ordered by rank
    const { data: allRanks, error: ranksError } = await supabase
      .from("employee_ranks")
      .select("*")
      .order("rank_level", { ascending: true }); // Ensure ranks are ordered correctly

    if (ranksError || !allRanks) {
      console.error("RANKS FETCH ERROR:", ranksError);
      return NextResponse.json(
        { error: "Error fetching ranks" },
        { status: 500 }
      );
    }

    // Step 3: Find the current rank's index and get the next rank in order
    const currentRankIndex = allRanks.findIndex((rank) => rank.id === currentRank);

    // If the employee is at the highest rank, return an error message
    if (currentRankIndex === allRanks.length - 1) {
      return NextResponse.json({
        success: false,
        message: "Employee already at highest rank",
      });
    }

    // Get the next rank
    const nextRank = allRanks[currentRankIndex + 1];
    const today = new Date().toISOString();

    // Step 4: Update employee's rank to the next rank
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        rank_id: nextRank.id,
        last_promotion_date: today,
      })
      .eq("id", id);

    if (updateError) {
      console.error("UPDATE ERROR:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Step 5: Return the updated rank details
    return NextResponse.json({
      success: true,
      rank: nextRank.rank_name,
      wage: nextRank.wage,
      rank_id: nextRank.id,
      last_promotion_date: today,
    });
  } catch (err) {
    console.error("PROMOTION CRASH:", err);
    return NextResponse.json(
      { error: "Promotion server error" },
      { status: 500 }
    );
  }
}