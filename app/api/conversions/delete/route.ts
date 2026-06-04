import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { id } = body

    const { error } =
      await supabase

        .from("item_conversions_v2")

        .delete()

        .eq("id", id)

    if (error) {

      console.error(
        "Delete conversion error:",
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
      "Delete conversion crash:",
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