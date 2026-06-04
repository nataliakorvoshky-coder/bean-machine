import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  try {

    const { data, error } =
      await supabase

        .from("stock_items")

        .select("*")

        .order("name", {
          ascending: true
        })

    if (error) {

      console.error(
        "Usage get error:",
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
      items: data || []
    })

  } catch (err: any) {

    console.error(
      "Usage get crash:",
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