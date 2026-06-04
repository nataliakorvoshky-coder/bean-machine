import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {
      id,
      updates
    } = body

    const { data, error } =
      await supabase

        .from("stock_items")

        .update(updates)

        .eq("id", id)

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
      success: true,
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