import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {

    const body = await req.json()

    console.log("NEW APPLICATION:", body)

    const { error } = await supabase
      .from("applications")
      .insert([body])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}