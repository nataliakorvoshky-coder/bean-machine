import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const user = searchParams.get("user")
  const type = searchParams.get("type")

  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })

  if (user) {
    query = query.eq("username", user)
  }

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) {

    console.error("❌ Activity fetch failed:", error.message)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    logs: data || []
  })
}

export async function POST(req: Request) {

  try {

    const body = await req.json()

    console.log("🔥 ACTIVITY BODY:", body)

 await logActivity({

  action:
    body.action,

  type:
    body.type,

  userId:
    body.userId,

  employeeName:
    body.employeeName,

  username:
    body.username,

  details:
    body.details,
})

    return NextResponse.json({
      success: true
    })

  } catch (err: any) {

    console.error("❌ ACTIVITY ROUTE ERROR:", err)

    return NextResponse.json(
      {
        error: err.message || "Server error"
      },
      {
        status: 500
      }
    )
  }
}