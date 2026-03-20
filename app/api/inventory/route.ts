import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    console.log("Received action:", action)
    console.log("Received body:", body)

    /* ================================= */
    /* ADD STOCK ITEMS                   */
    /* ================================= */
    if (action === "addStockItem") {
      const { name, section, current_amount, goal_amount } = body

      if (!name || !section || current_amount === undefined || goal_amount === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const { error } = await supabase
        .from("stock_items")
        .insert([{ name, section, current_amount, goal_amount }])

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* DELETE STOCK ITEMS                */
    /* ================================= */
    if (action === "deleteStockItem") {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: "Stock item ID is required" }, { status: 400 })
      }

      const { error } = await supabase
        .from("stock_items")
        .delete()
        .eq("id", id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* GET STOCK ITEMS                   */
    /* ================================= */
    if (action === "getStockItems") {
      const { data, error } = await supabase
        .from("stock_items")
        .select("*")
        .order("name")

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json(data ?? [])
    }

    /* ================================= */
    /* GET EXTERNAL STOCK                */
    /* ================================= */
    if (action === "getExternalStock") {
      const { data, error } = await supabase
        .from("external_stock")
        .select("*")
        .order("name")

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json(data ?? [])
    }

    /* ================================= */
    /* ADD EXTERNAL STOCK                */
    /* ================================= */
    if (action === "addExternalStock") {
      const { name, price } = body

      if (!name || price === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const { error } = await supabase
        .from("external_stock")
        .insert([{ name, price }])

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* DELETE EXTERNAL STOCK             */
    /* ================================= */
    if (action === "deleteExternalStock") {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: "External stock ID is required" }, { status: 400 })
      }

      const { error } = await supabase
        .from("external_stock")
        .delete()
        .eq("id", id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* ADD CONVERSION                    */
    /* ================================= */
    if (action === "createConversion") {
      const { externalStockId, stockItemId, externalQuantity, stockQuantity } = body

      if (!externalStockId || !stockItemId || externalQuantity === undefined || stockQuantity === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const { error } = await supabase
        .from("item_conversion")
        .insert([{
          external_stock_item_id: externalStockId,
          stock_item_id: stockItemId,
          external_quantity: externalQuantity,
          stock_quantity: stockQuantity
        }])

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* DELETE CONVERSION                 */
    /* ================================= */
    if (action === "deleteConversion") {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: "Conversion ID is required" }, { status: 400 })
      }

      const { error } = await supabase
        .from("item_conversion")
        .delete()
        .eq("id", id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* GET CONVERSIONS                   */
    /* ================================= */
    if (action === "getConversions") {
      const { data, error } = await supabase
        .from("item_conversion")
        .select(`
          id,
          external_quantity,
          stock_quantity,
          external_stock:external_stock_item_id(name),
          stock_item:stock_item_id(name)
        `)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json(data ?? [])
    }

   /* ================================= */
/* GET RESTOCK NEEDED (FIXED)        */
/* ================================= */
if (action === "getRestockNeeded") {

  const { data: stockItems, error: stockError } = await supabase
    .from("stock_items")
    .select("id, name, current_amount, goal_amount")

  if (stockError) {
    return NextResponse.json({ error: stockError.message }, { status: 500 })
  }

  const { data: conversions } = await supabase
    .from("item_conversion")
    .select(`
      stock_item_id,
      external_quantity,
      stock_quantity,
      external_stock:external_stock_item_id(name)
    `)

  const result: any[] = []

  stockItems?.forEach(stock => {

    const current = Number(stock.current_amount) || 0
    const goal = Number(stock.goal_amount) || 0

    const needed = goal - current

    // ✅ show ALL low items
    if (needed <= 0) return

    const conv = conversions?.find(c => c.stock_item_id === stock.id)

    // ✅ CASE 1: has conversion
    if (conv) {

      const ratio =
        (conv.stock_quantity || 1) / (conv.external_quantity || 1)

      const externalNeeded = Math.ceil(needed / ratio)

      result.push({
        external_name: conv.external_stock?.name || stock.name,
        needed_external: externalNeeded,
        stock_id: stock.id,
        needed_stock: needed
      })

    }

    // ✅ CASE 2: NO conversion (🔥 THIS FIXES YOUR ISSUE)
    else {

      result.push({
        external_name: stock.name,
        needed_external: needed,
        stock_id: stock.id,
        needed_stock: needed
      })

    }

  })

  console.log("RESTOCK RESULT:", result)

  return NextResponse.json(result)
}

/* ================================= */
/* 🔥 SUBMIT RESTOCK (FINAL FIX)     */
/* ================================= */
if (action === "submitRestock") {

  const { items } = body

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items payload" }, { status: 400 })
  }

  for (const item of items) {

    const { stock_id, needed_stock } = item

    if (!stock_id || typeof needed_stock !== "number") continue

    // 🔹 Get current + goal
    const { data: stock } = await supabase
      .from("stock_items")
      .select("current_amount, goal_amount")
      .eq("id", stock_id)
      .single()

    if (!stock) continue

    const current = stock.current_amount || 0
    const goal = stock.goal_amount || 0

    // 🔥 Remaining needed
    const remaining = goal - current

    if (remaining <= 0) continue

    // 🔥 KEY FIX: only add what's still needed
    const amountToAdd = Math.min(needed_stock, remaining)

    const newAmount = current + amountToAdd

    await supabase
      .from("stock_items")
      .update({ current_amount: newAmount })
      .eq("id", stock_id)
  }

  return NextResponse.json({ success: true })
}
    /* ================================= */
    /* UPDATE STOCK CURRENT              */
    /* ================================= */
    if (action === "updateStockCurrent") {
      const { id, current_amount } = body

      if (!id || typeof current_amount !== "number") {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 })
      }

      const { error } = await supabase
        .from("stock_items")
        .update({ current_amount })
        .eq("id", id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* UPDATE STOCK GOAL                 */
    /* ================================= */
    if (action === "updateStockGoal") {
      const { id, goal_amount } = body

      if (!id || typeof goal_amount !== "number") {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 })
      }

      const { error } = await supabase
        .from("stock_items")
        .update({ goal_amount })
        .eq("id", id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* DEFAULT                           */
    /* ================================= */
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error: any) {
    console.error("Inventory API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

