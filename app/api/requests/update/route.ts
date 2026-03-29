import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const supabase = getSupabaseServer();

export async function POST(req: Request) {
  const { id, updates, manager } = await req.json();

  /* 🔥 GET CURRENT REQUEST */
  const { data: existing, error: fetchError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  /* ========================= */
  /* 🕒 AUTO RELEASE CHECK     */
  /* ========================= */

  const isExpired =
    existing.claimed_at &&
    Date.now() - new Date(existing.claimed_at).getTime() >
      2 * 60 * 1000; // 2 minutes

  // 🔥 AUTO CLEAR EXPIRED CLAIM
  if (isExpired) {
    await supabase
      .from("requests")
      .update({
        claimed_by: null,
        claimed_at: null,
        status: "Viewed",
      })
      .eq("id", id);

    existing.claimed_by = null;
    existing.claimed_at = null;
  }

  /* ========================= */
  /* 🔒 LOCK ENFORCEMENT       */
  /* ========================= */

  if (
    existing.claimed_by &&
    existing.claimed_by !== manager &&
    updates.status !== "Viewed"
  ) {
    return NextResponse.json(
      { error: "Request already claimed by another manager" },
      { status: 403 }
    );
  }

  /* ========================= */
  /* 🔥 AUTO SET CLAIM TIME    */
  /* ========================= */

  const finalUpdates = { ...updates };

  // If claiming → set timestamp
  if (updates.claimed_by) {
    finalUpdates.claimed_at = new Date().toISOString();
  }

  // If unclaiming → clear timestamp
  if (updates.claimed_by === null) {
    finalUpdates.claimed_at = null;
  }

  /* ========================= */
  /* 🔥 UPDATE                 */
  /* ========================= */

  const { data, error } = await supabase
    .from("requests")
    .update(finalUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}