import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/* ============================== */
/* Clean value                    */
/* ============================== */
function clean(v: any) {
  if (!v) return null
  const val = Array.isArray(v) ? v[0] : v
  if (typeof val === "string" && val.trim() === "") return null
  return val
}

/* ============================== */
/* Try multiple keys              */
/* ============================== */
function pick(body: any, keys: string[]) {
  for (const key of keys) {
    if (body[key] !== undefined) {
      const v = clean(body[key])
      if (v !== null) return v
    }
  }
  return null
}

/* ============================== */
/* POST                           */
/* ============================== */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("🔥 RAW BODY:", body)

    /* ============================== */
    /* 🔥 IMPORTANT: USE SAME ID      */
    /* ============================== */
    const id = body.id || crypto.randomUUID()

    const application = {
      id, // ✅ THIS FIXES EVERYTHING

      discord: pick(body, [
        "discord",
        "Discord Username",
        "discord_username",
      ]),

      timezone: pick(body, ["timezone"]),
      age: pick(body, ["age"]),
      cid: pick(body, ["cid"]),
      name: pick(body, ["name"]),
      phone: pick(body, ["phone"]),

      in_city_age: pick(body, ["in_city_age"]),
      time_in_city: pick(body, ["time_in_city"]),

      experience: pick(body, ["experience", "restaurant_exp"]),
      why_join: pick(body, ["why_join"]),
      activity_level: pick(body, ["activity_level"]),

      weekly_hours: pick(body, ["weekly_hours", "min_hours"]),
      night_shift: pick(body, ["night_shift", "night_work"]),
      gang_member: pick(body, ["gang_member", "gang"]),

      gz_ack: pick(body, [
        "gz_ack",
        "Bean Machine GZ Acknowledgement",
      ]),

      created_at: body.created_at || new Date().toISOString(),
    }

    console.log("✅ FINAL DATA:", application)

    /* ============================== */
    /* INSERT                         */
    /* ============================== */
    const { error } = await supabase
      .from("applications")
      .insert([application])

    if (error) {
      console.error("❌ SUPABASE ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("❌ API ERROR:", err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}