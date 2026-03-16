import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Backend API (Demote Employee)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
      // Unwrap the Promise from params
      const { id } = await params;

      if (!id) {
         return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
      }

      // Proceed with the demotion logic here
      const { data: employee, error } = await supabase
         .from("employees")
         .select("rank_id")
         .eq("id", id)
         .single();

      if (error || !employee) {
         return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      // Demote logic
      const currentRankId = employee.rank_id;

      // Fetch the next rank for demotion
      const { data: prevRank } = await supabase
         .from("employee_ranks")
         .select("id, rank_name, wage")
         .lt("id", currentRankId)  // Get previous rank
         .order("id", { ascending: false })
         .limit(1)
         .single();

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