import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  try {

    const { data, error } =
      await supabase

        .from("item_conversions_v2")

        .select("*")

.order("id", {
  ascending: false
})

    if (error) {

      console.error(
        "Get conversions error:",
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
      conversions:
        data || []
    })

  } catch (err: any) {

    console.error(
      "Get conversions crash:",
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