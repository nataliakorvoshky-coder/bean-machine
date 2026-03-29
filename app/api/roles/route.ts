import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data, error } = await supabase
      .from("roles")
      .select("id, name")
      .order("name")

    if (error) {
      console.error("Roles API error:", error)
      return NextResponse.json({ roles: [] }, { status: 500 })
    }

    return NextResponse.json({
      roles: data ?? []
    })

  } catch (err) {
    console.error("Roles API crash:", err)
    return NextResponse.json({ roles: [] }, { status: 500 })
  }
}