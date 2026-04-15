import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// 🔥 CREATE CONVERSION (NEW SYSTEM)
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { from_item_id, to_item_id, from_quantity, to_quantity, type } = body

    if (!from_item_id || !to_item_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    if (from_item_id === to_item_id) {
      return NextResponse.json({ error: "Invalid conversion" }, { status: 400 })
    }

    const { error } = await supabase
      .from("item_conversions_v2")
.insert({
  from_item_id,
  to_item_id,
  from_quantity,
  to_quantity,
  type
})

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// 🔥 GET CONVERSIONS
export async function GET() {
  const { data, error } = await supabase
    .from("item_conversions_v2")
.select(`
  id,
  from_item_id,
  to_item_id,
  from_quantity,
  to_quantity,
  type
`)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}