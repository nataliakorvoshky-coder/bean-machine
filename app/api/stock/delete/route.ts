import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { id } = body

    if (!id) {

      return NextResponse.json(
        {
          error:
            "Missing id"
        },
        {
          status: 400
        }
      )
    }

    const { error } =
      await supabase

        .from("stock_items")

        .delete()

        .eq("id", id)

    if (error) {

      console.error(
        "Delete stock item error:",
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
      success: true
    })

  } catch (err: any) {

    console.error(
      "Stock delete crash:",
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