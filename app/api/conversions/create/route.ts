import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {
      from_item_id,
      to_item_id,
      from_quantity,
      to_quantity,
      type
    } = body

    const { data, error } =
      await supabase

        .from("item_conversions_v2")

        .insert([{
          from_item_id,
          to_item_id,
          from_quantity,
          to_quantity,
          type
        }])

        .select()

        .single()

    if (error) {

      console.error(
        "Create conversion error:",
        error
      )

      return NextResponse.json(
        {
          error:
            error.message
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      success: true,
      conversion: data
    })

  } catch (err: any) {

    console.error(
      "Create conversion crash:",
      err
    )

    return NextResponse.json(
      {
        error:
          err.message
      },
      {
        status: 500
      }
    )
  }
}