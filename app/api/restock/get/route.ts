export const dynamic =
  "force-dynamic"

export const revalidate = 0

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  try {

    const {
      data: stockItems,
      error: stockError,
    } = await supabase

      .from("stock_items")

      .select("*")

    const {
      data: externalItems,
    } = await supabase

      .from("external_stock")

      .select("*")

    const {
      data: conversions,
      error: conversionError,
    } = await supabase

      .from("item_conversions_v2")

      .select("*")

    if (
      stockError ||
      conversionError
    ) {

      return NextResponse.json(
        {
          error:
            "Failed to load planner",
        },
        {
          status: 500,
        }
      )
    }

    const buyMap:
      Record<
        string,
{
  name: string
  amount: number

  produced_internal: number

  stock_ids: string[]

  breakdown: {
    stock_id: string
    needed: number
  }[]

  needed_stock: number
}

      > = {}

    const craft: any[] = []

    const processedGroups =
      new Set<string>()

for (const item of stockItems || []) {

  const groupKey =
    item.name
      ?.trim()
      .toLowerCase()

  if (
    processedGroups.has(groupKey)
  ) {
    continue
  }

  processedGroups.add(groupKey)

  const groupedStockItems =
    (stockItems || []).filter(
      (s:any)=>
        s.name
          ?.trim()
          .toLowerCase() === groupKey
    )

  const totalDeficit =
    groupedStockItems.reduce(
      (sum:number,s:any)=>
        sum +
        Math.max(
          s.goal_amount -
          s.current_amount,
          0
        ),
      0
    )

  if (totalDeficit <= 0)
    continue

  const recipes =
    (conversions || [])
      .filter(
        (c: any) =>
          groupedStockItems.some(
            (s:any)=>
              s.id === c.to_item_id
          )
      )

      if (!recipes.length)
        continue

      for (const recipe of recipes) {

const matchingStockItems =
  groupedStockItems

        const amountNeeded = Math.ceil(

          (totalDeficit / recipe.to_quantity)

          * recipe.from_quantity

        )

        /*
        ==========================
        PURCHASE
        ==========================
        */

        if (recipe.type === "purchase") {

          const externalItem =
            externalItems?.find(
              (i: any) =>
                i.id === recipe.from_item_id
            )

          const externalName =

            externalItem?.name ||

            "Unknown Item"

          if (
            !buyMap[
              externalName
            ]
          ) {

buyMap[
  externalName
] = {

  name:
    externalName,

  amount:
    amountNeeded,

  produced_internal:

    amountNeeded *

    Number(
      recipe.to_quantity || 1
    ),

  stock_ids:
    groupedStockItems.map(
      (s:any)=>s.id
    ),

  breakdown:
    groupedStockItems.map(
      (s:any)=>({

        stock_id:
          s.id,

        needed:
          Math.max(
            s.goal_amount -
            s.current_amount,
            0
          )
      })
    ),

  needed_stock:
    totalDeficit,
}
          }
        }

        /*
        ==========================
        CRAFT
        ==========================
        */

        if (recipe.type === "craft") {

          const fromItem =
            stockItems.find(
              (i: any) =>
                i.id === recipe.from_item_id
            )

          craft.push({

            from:
              fromItem?.name ||
              "Unknown",

            to:
              item.name,

            amount:
              amountNeeded,
          })
        }
      }
    }

    return NextResponse.json({

      buy:
        Object.values(
          buyMap
        ),

      craft,
    })

  } catch (err: any) {

    console.error(
      "Restock get crash:",
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