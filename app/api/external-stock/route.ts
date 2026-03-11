import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  const { data, error } = await supabase
    .from("external_stock")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("GET ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}


export async function POST(req: Request) {

  try {

    const body = await req.json()

    const { name, price } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("external_stock")
      .insert([
        {
          name: name,
          price: price
        }
      ])
      .select()

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (err) {
    console.error("SERVER ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


export async function DELETE(req: Request) {

  const body = await req.json()

  const { id } = body

  const { error } = await supabase
    .from("external_stock")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("DELETE ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}