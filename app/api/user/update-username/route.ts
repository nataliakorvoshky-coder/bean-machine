import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { username } = await req.json()

    if (!username || username.trim() === "") {
      return NextResponse.json(
        { error: "Username required" },
        { status: 400 }
      )
    }

    // 🔐 get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // 🔥 check duplicate (exclude current user)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // ✅ update
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}