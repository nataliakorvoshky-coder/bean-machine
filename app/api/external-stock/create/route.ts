import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { name } = body

    const { data, error } =
      await supabase

        .from("external_stock")

        .insert([{ name }])

        .select()

        .single()

    if (error) {

      return NextResponse.json(
        {
          error: error.message
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      item: data
    })

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message
      },
      {
        status: 500
      }
    )
  }
}