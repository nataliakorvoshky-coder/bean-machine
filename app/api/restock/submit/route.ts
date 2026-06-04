import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { items } = body

    const validItems =
      items.filter(
        (i: any) =>

          Number(
            i.external_quantity
          ) > 0
      )

    const processed: string[] = []

    for (const item of validItems) {

      const totalCost =

        Number(
          item.external_quantity
        ) *

        Number(
          item.price_each || 0
        )

      await supabase

        .from("external_stock")

        .insert({

          stock_item_id:
            item.stock_ids?.[0],

          item_name:
            item.name,

          quantity:
            Number(
              item.external_quantity
            ),

          price_each:
            Number(
              item.price_each
            ),

          total_cost:
            totalCost,

          created_at:
            new Date()
              .toISOString(),
        })

const purchasedExternal =

  Number(
    item.external_quantity || 0
  )

let remainingInventory =

  Number(
    item.produced_internal ||

    item.needed_stock ||

    0
  )

console.log(

  "RESTOCK CALCULATION:",

  {

    item:
      item.name,

    purchasedExternal,

    producedInternal:
      item.produced_internal,

    remainingInventory,
  }
)

for (
  const stock of
  item.breakdown || []
) {

  const stockId =
    stock.stock_id

  const {
    data: existing,
  } = await supabase

    .from("stock_items")

    .select("*")

    .eq(
      "id",
      stockId
    )

    .single()

  if (!existing)
    continue

  const current =
    Number(
      existing.current_amount || 0
    )

  const goal =
    Number(
      existing.goal_amount || 0
    )


  const deficit =

    Math.max(
      goal - current,
      0
    )

const amountToAdd =

  Math.min(
    deficit,
    remainingInventory
  )

remainingInventory -=
  amountToAdd

  const newAmount =
    current +
    amountToAdd

  const overGoal =
    Math.max(
      0,
      newAmount - goal
    )

  const updateResult =
    await supabase

      .from("stock_items")

      .update({

        current_amount:
          newAmount,

      })

      .eq(
        "id",
        stockId
      )

      .select()

  console.log(

    "UPDATED STOCK:",

    stockId,

    {

      previousAmount:
        current,

      added:
        amountToAdd,

      currentAmount:
        newAmount,

      overGoal,
    }
  )

  console.log(
    "UPDATED STOCK:",
    stockId,
    updateResult
  )
}

if (

  remainingInventory > 0 &&

  item.breakdown?.length

) {

  const firstStockId =

    item.breakdown[0]
      .stock_id

  const {
    data: firstLocation
  } = await supabase

    .from("stock_items")

    .select("*")

    .eq(
      "id",
      firstStockId
    )

    .single()

  if (firstLocation) {

    const overstockAmount =

      Number(
        firstLocation.current_amount || 0
      )

      +

      remainingInventory

    await supabase

      .from("stock_items")

      .update({

        current_amount:
          overstockAmount,

      })

      .eq(
        "id",
        firstStockId
      )

    console.log(

      "OVERSTOCK APPLIED:",

      firstStockId,

      {

        added:
          remainingInventory,

        finalAmount:
          overstockAmount,
      }
    )
  }
}

console.log(
  JSON.stringify(
    item,
    null,
    2
  )
)

      processed.push(
        item.name
      )
    }

    return NextResponse.json({

      success: true,

      processed,
    })

  } catch (err: any) {

    console.error(
      "Restock submit crash:",
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