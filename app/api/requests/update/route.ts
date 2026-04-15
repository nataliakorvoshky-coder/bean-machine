import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = getSupabaseServer();

  const { id, updates, manager } = await req.json();

  /* ========================= */
  /* 🔥 GET CURRENT REQUEST    */
  /* ========================= */

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
      2 * 60 * 1000;

  if (isExpired && existing.status === "In Progress") {
    await supabase
      .from("requests")
      .update({
        claimed_by: null,
        claimed_at: null,
        status:
  existing.status === "In Progress"
    ? "Viewed"
    : existing.status,
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
  /* 🔥 SAFE MERGE UPDATES     */
  /* ========================= */

/* ========================= */
/* 🔥 SAFE FINAL UPDATE LOGIC */
/* ========================= */

const finalUpdates: any = {};

// ✅ CHECK IF FINAL STATE
const isFinal =
  ["Approved", "Denied"].includes(existing.status) ||
  ["Approved", "Denied"].includes(updates.status);

/* ========================= */
/* ✅ STATUS (TOP PRIORITY)   */
/* ========================= */
if (updates.status) {
  finalUpdates.status = updates.status;
}

/* ========================= */
/* ✅ CLAIM HANDLING          */
/* ========================= */
if (!isFinal) {
  if (updates.claimed_by !== undefined) {
    finalUpdates.claimed_by = updates.claimed_by;
  }

  if (updates.claimed_at !== undefined) {
    finalUpdates.claimed_at = updates.claimed_at;
  }
}

/* ========================= */
/* ✅ ANSWER INFO             */
/* ========================= */
if (updates.answered_by) {
  finalUpdates.answered_by = updates.answered_by;
}

if (updates.answered_at) {
  finalUpdates.answered_at = updates.answered_at;
}

/* ========================= */
/* ✅ NOTE FIELD              */
/* ========================= */
if (updates.note !== undefined) {
  finalUpdates.note = updates.note;
}

/* ========================= */
/* ✅ 🔥 SAFE NOTES MERGE     */
/* ========================= */
if (updates.notes_history) {
  finalUpdates.notes_history = [
    ...(existing.notes_history || []),
    ...updates.notes_history,
  ];
}
/* ========================= */
/* 🔥 DEBUG (KEEP THIS)       */
/* ========================= */
console.log("FINAL UPDATE:", finalUpdates);


  /* ========================= */
  /* 🔥 UPDATE (CRITICAL)      */
  /* ========================= */

  const { data, error } = await supabase
    .from("requests")
    .update(finalUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  /* ========================= */
  /* 🔥 RETURN CLEAN ROW       */
  /* ========================= */

  return NextResponse.json(data);
}