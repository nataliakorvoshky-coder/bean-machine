import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  try {

    const {
      data,
      error
    } = await supabase

      .from("stock_restock_log")

      .select("*")

      .order("created_at", {
        ascending: false
      })

    if (error) {

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
      restocks:
        data || []
    })

  } catch (err: any) {

    console.error(
      "Restock history crash:",
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