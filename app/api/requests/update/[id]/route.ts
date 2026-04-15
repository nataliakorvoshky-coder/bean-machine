import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing request ID" },
        { status: 400 }
      );
    }

    console.log("UPDATE REQUEST ID:", id);

    const body = await req.json();
    const { start_date, end_date, note, type } = body;

const { data: existing } = await supabase
  .from("requests")
  .select("notes_history, pending_updates, status")
  .eq("id", id)
  .single();

    const history = Array.isArray(existing?.notes_history)
  ? existing.notes_history
  : [];

    if (note || type) {
history.push({
  text: note || "Request updated",
  by: "Employee",
  at: new Date().toISOString(),
  type: type || "Update",

  // 🔥 THIS IS WHY YOU SEE NOTHING
  start_date,
  end_date,
});
    }

    const { error } = await supabase
      .from("requests")
      .update({
pending_updates: [
  ...(Array.isArray(existing?.pending_updates)
    ? existing.pending_updates
    : []),

  {
    id: crypto.randomUUID(),

    ...(start_date !== undefined && { start_date }),
    ...(end_date !== undefined && { end_date }),
    ...(type && { type }),

    created_at: new Date().toISOString(),
    status: "Pending",
  },
],
        notes_history: history,
        status:
  existing?.status === "Approved" || existing?.status === "Denied"
    ? existing.status
    : "Pending",
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}