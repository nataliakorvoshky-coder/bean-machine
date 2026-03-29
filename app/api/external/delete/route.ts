import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    console.log("🗑 DELETE ID:", id)

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID" },
        { status: 400 }
      )
    }

    /* ============================== */
    /* 🗑 DELETE FROM SUPABASE        */
    /* ============================== */
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("❌ SUPABASE DELETE ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log("✅ Deleted from Supabase")

    /* ============================== */
    /* 🗑 DELETE FROM GOOGLE SHEET    */
    /* ============================== */
    try {
      const res = await fetch(process.env.GOOGLE_SCRIPT_DELETE_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ FIX
        },
        body: JSON.stringify({
          action: "delete",
          id,
          secret: process.env.GOOGLE_SECRET, // ✅ FIX (if using security)
        }),
      })

      const text = await res.text()

      console.log("📡 GOOGLE STATUS:", res.status)
      console.log("📡 GOOGLE RESPONSE:", text)

      if (!res.ok) {
        throw new Error("Google script failed")
      }

    } catch (googleErr) {
      console.error("⚠️ GOOGLE DELETE FAILED:", googleErr)

      // 🔥 IMPORTANT: do NOT fail whole request
      // Supabase delete already succeeded
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("❌ DELETE ERROR:", err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}