import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  try {

    /*
    ==========================
    STOCK ITEMS
    ==========================
    */

    const {
      data: items,
      error: itemsError
    } = await supabase

      .from("stock_items")

      .select("*")

    /*
    ==========================
    USAGE HISTORY
    ==========================
    */

    const {
      data: usage,
      error: usageError
    } = await supabase

      .from("stock_usage")

      .select("*")

      .order("created_at", {
        ascending: false
      })

    if (
      itemsError ||
      usageError
    ) {

      return NextResponse.json(
        {
          error:
            "Failed analytics load"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      items:
        items || [],

      usage:
        usage || [],
    })

  } catch (err: any) {

    console.error(
      "Analytics overview crash:",
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