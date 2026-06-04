import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {
      usage,
      newStock
    } = body

    /*
    ==========================
    UPDATE STOCK
    ==========================
    */

    for (const stockId in newStock) {

      await supabase

        .from("stock_items")

        .update({
          current_amount:
            newStock[stockId]
        })

        .eq("id", stockId)
    }

    /*
    ==========================
    SAVE USAGE HISTORY
    ==========================
    */

    for (const stockId in usage) {

      await supabase

        .from("inventory_usage")

        .insert([{
          stock_item_id:
            stockId,

          amount_used:
            usage[stockId]
        }])
    }

    return NextResponse.json({
      success: true
    })

  } catch (err: any) {

    console.error(
      "Usage submit crash:",
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