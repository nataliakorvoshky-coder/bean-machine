import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { items } = body

    for (const item of items) {

      /* =========================
         SAVE HISTORY
      ========================= */

      await supabase

        .from(
          "conversion_history"
        )

        .insert({

          from_item:
            item.from,

          to_item:
            item.to,

          amount:
            item.amount,

          created_at:
            new Date()
              .toISOString(),
        })

      /* =========================
         ADD TO TARGET ITEM
      ========================= */

const {
  data: target
} = await supabase

  .from("stock_items")

  .select("*")

  .eq("name", item.to)

  .single()

if (target) {

  const {
    data: recipe
  } = await supabase

    .from(
      "item_conversions_v2"
    )

    .select("*")

    .eq(
      "type",
      "craft"
    )

    .eq(
      "to_item_id",
      target.id
    )

    .single()

  const producedAmount =

    Number(
      item.amount || 0
    )

    *

    Number(
      recipe?.to_quantity || 1
    )

  const newAmount =

    Number(
      target.current_amount || 0
    )

    +

    producedAmount

  const overGoal =

    Math.max(

      0,

      newAmount -

      Number(
        target.goal_amount || 0
      )
    )

  console.log({

    item:
      target.name,

    current:
      target.current_amount,

    crafted:
      item.amount,

    producedAmount,

    goal:
      target.goal_amount,

    newAmount,

    overGoal,
  })

  await supabase

    .from("stock_items")

    .update({

      current_amount:
        newAmount

    })

    .eq(
      "id",
      target.id
    )
}

      /* =========================
         SUBTRACT FROM SOURCE ITEM
      ========================= */

      const {
        data: source
      } = await supabase

        .from("stock_items")

        .select("*")

        .eq("name", item.from)

        .single()

      if (source) {

        await supabase

          .from("stock_items")

          .update({

current_amount:
  Math.max(

    0,

    source.current_amount -

    Number(
      item.amount || 0
    )

  )

          })

          .eq("id", source.id)
      }
    }

    return NextResponse.json({
      success: true,
    })

  } catch (err: any) {

    console.error(
      "Craft submit crash:",
      err
    )

    return NextResponse.json(
      {
        error:
          err.message
      },
      {
        status: 500,
      }
    )
  }
}