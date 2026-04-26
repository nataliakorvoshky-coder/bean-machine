import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type Conversion = {
  from_item_id: string;
  to_item_id: string;
  from_quantity: number;
  to_quantity: number;
  type: "craft" | "purchase";
};

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    console.log("Received action:", action)
    console.log("Received body:", body)

    console.log("ACTION:", action);
    console.log("USAGE:", body.usage);
    console.log("NEW STOCK:", body.newStock);


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
      const { name } = body;

      if (!name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("external_stock")
        .insert([{ name }])
        .select()   // 🔥 THIS IS THE KEY FIX

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data[0]); // 🔥 RETURN NEW ITEM
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
      const { externalStockId, stockItemId, externalQuantity, stockQuantity } = body;

      if (!externalStockId || !stockItemId || externalQuantity === undefined || stockQuantity === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("item_conversions_v2")
        .insert({
          from_item_id: externalStockId,
          to_item_id: stockItemId,
          from_quantity: externalQuantity,
          to_quantity: stockQuantity,
          type: "purchase" // or pass from frontend
        })

      if (error) {
        console.error("❌ CONVERSION ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }); // 🚨 THIS FIXES EVERYTHING
    }

    /* ================================= */
    /* DELETE CONVERSION                 */
    /* ================================= */
    if (action === "deleteConversion") {
      const { id } = body;

      const { error } = await supabase
        .from("item_conversions_v2")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    /* ================================= */
    /* GET CONVERSIONS                   */
    /* ================================= */
    if (action === "getConversions") {
      const { data: conversions, error } = await supabase
        .from("item_conversions_v2")
        .select(`
      id,
      from_item_id,
      to_item_id,
      from_quantity,
      to_quantity,
      type
    `)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }


      return NextResponse.json(conversions ?? [])
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
        .from("item_conversions_v2")
        .select(`
    id,
    from_item_id,
    to_item_id,
    from_quantity,
    to_quantity,
    type
  `)

      // 🔥 STEP 2: BUILD CONVERSION MAP (KEY FIX)
      const conversionGraph = new Map<string, Conversion[]>()

      conversions?.forEach(c => {
        if (!conversionGraph.has(c.to_item_id)) {
          conversionGraph.set(c.to_item_id, [])
        }

        const list = conversionGraph.get(c.to_item_id)!
        list.push(c)
      });

      const grouped: any = {}

      stockItems?.forEach(stock => {

        const current = Number(stock.current_amount) || 0
        const goal = Number(stock.goal_amount) || 0
        const needed = goal - current

        if (needed <= 0) return
        const fullGoal = goal

        // 🔥 GROUP BY NAME (Milk from BOTH sections)
        if (!grouped[stock.name]) {
          grouped[stock.name] = {
            name: stock.name,
            total_needed: 0,
            stock_ids: [],
            breakdown: [] // ✅ ADD
          }
        }

        grouped[stock.name].total_needed += needed
        grouped[stock.name].stock_ids.push(stock.id)
        grouped[stock.name].breakdown.push({
          stock_id: stock.id,
          needed
        })

      });

      const buyList: any[] = []
      const craftMap = new Map()

      const { data: externalItems } = await supabase
        .from("external_stock")
        .select("id, name")

      const itemNameMap = new Map()

      stockItems?.forEach(i => {
        itemNameMap.set(i.id, i.name)
      });

      externalItems?.forEach(i => {
        itemNameMap.set(i.id, i.name)
      });

      Object.values(grouped).forEach((item: any) => {

        // 🔥 SUM ALL STOCK IDS (they are same item type)
        const itemId =
          item.stock_ids.find((id: string) => conversionGraph.has(id)) ||
          item.stock_ids[0]

        const totalNeeded = item.total_needed
        const options = conversionGraph.get(itemId) || []

        const purchaseConv = options.find(c => c.type === "purchase")
        const craftConv = options.find(c => c.type === "craft")

        // 🛒 BUY ONLY FOR DIRECT STOCK GOAL
        if (purchaseConv) {
          const ratio = purchaseConv.from_quantity / purchaseConv.to_quantity
          const buyAmount = item.total_needed * ratio

          const buyName = itemNameMap.get(purchaseConv.from_item_id) || "Unknown"
          const amount = Math.ceil(buyAmount)

          const existing = buyList.find(b => b.name === buyName)

          if (existing) {
            existing.amount += amount
          } else {
            buyList.push({
              name: buyName,
              amount,
              breakdown: item.breakdown // ✅ ADD THIS
            })
          }
        }


        // 🛠 CRAFT ONLY FOR DIRECT GOAL (NO PROPAGATION)
        if (craftConv) {

          const ratio = craftConv.from_quantity / craftConv.to_quantity

          // 🔥 FIX: calculate FULL missing amount across ALL fridges
          const stockRows = stockItems?.filter(s => s.name === item.name) || []

          const totalGoal = stockRows.reduce((sum, s) => sum + (s.goal_amount || 0), 0)
          const totalCurrent = stockRows.reduce((sum, s) => sum + (s.current_amount || 0), 0)

          const fullNeeded = totalGoal - totalCurrent

          const craftAmount = Math.ceil(fullNeeded * ratio)

          const fromName = itemNameMap.get(craftConv.from_item_id)
          const toName = itemNameMap.get(craftConv.to_item_id)

          const key = `${fromName}→${toName}`

          if (craftMap.has(key)) {
            craftMap.get(key).amount += craftAmount
          } else {
            craftMap.set(key, {
              from: fromName,
              to: toName,
              amount: craftAmount
            })
          }
        }

      });

      console.log("RESTOCK RESULT:", {
        buyList,
        craftList: Array.from(craftMap.values())
      })

      // ✅ SORT BUY
      buyList.sort((a, b) => a.name.localeCompare(b.name))

      // ✅ SORT CRAFT
      const craftList = Array.from(craftMap.values())

      craftList.sort((a, b) =>
        a.to.localeCompare(b.to)
      )

      // ✅ RETURN SORTED DATA
      return NextResponse.json({
        buy: buyList,
        craft: craftList
      })
    } // ✅ CLOSE getRestockNeeded

    /* ================================= */
    /* 🔥 SUBMIT RESTOCK (FINAL FIX)     */
    /* ================================= */
    if (action === "submitRestock") {

      const { items } = body

      if (!Array.isArray(items)) {
        return NextResponse.json({ error: "Invalid items payload" }, { status: 400 })
      }

      // 🔥 GROUP BY EXTERNAL ITEM (PREVENT DUPLICATES)
      const restockGrouped: Record<string, any> = {}

      for (const item of items) {

        const key = item.name // 👈 MUST be external item name (milk)

        if (!restockGrouped[key]) {
          restockGrouped[key] = {
            ...item,
            external_quantity: 0,
            needed_stock: 0,
            stock_ids: []
          }
        }

        // ✅ TAKE MAX (NOT SUM)
        restockGrouped[key].external_quantity = Math.max(
          restockGrouped[key].external_quantity,
          item.external_quantity
        )

        // ✅ SUM INTERNAL STOCK ADD
        restockGrouped[key].needed_stock += item.needed_stock

        restockGrouped[key].stock_ids.push(...(item.stock_ids || []))
      }

      for (const key in restockGrouped) {

        const item = restockGrouped[key];

        const stock_ids = item.stock_ids;
        const needed_stock = item.needed_stock;
        const external_quantity = item.external_quantity;

        // 🔥 ONLY process if price entered
        if (!item.price_each || Number(item.price_each) <= 0) continue

        if (!stock_ids || typeof needed_stock !== "number") continue

        // ✅ STEP 1: UPDATE ALL STOCK LOCATIONS + TRACK TOTAL
        let totalInternalAdded = 0;

        for (const stock_id of stock_ids) {

          const { data: stock } = await supabase
            .from("stock_items")
            .select("current_amount, goal_amount")
            .eq("id", stock_id)
            .single()

          if (!stock) continue

          const current = stock.current_amount || 0
          const goal = stock.goal_amount || 0

          const remaining = goal - current
          if (remaining <= 0) continue

          const amountToAdd = Math.min(remaining, needed_stock)

          totalInternalAdded += amountToAdd

          await supabase
            .from("stock_items")
            .update({ current_amount: current + amountToAdd })
            .eq("id", stock_id)
        }

        // ✅ STEP 2: LOG ONCE (AFTER LOOP)
        await supabase.from("stock_restock_log").insert({
          stock_item_id: stock_ids[0],
          quantity_added: external_quantity,
          price_each: Number(item.price_each),
          total_cost: Number(item.price_each) * external_quantity,
          internal_quantity_added: totalInternalAdded,
          created_at: new Date().toISOString()
        })
      }

      // 🔥 RETURN AFTER PROCESSING ALL ITEMS
      const { data: updatedStock } = await supabase
        .from("stock_items")
        .select("*")
        .order("name")

      return NextResponse.json({
        success: true,
        updatedStock: updatedStock ?? []
      })
    }


    /* ================================= */
    /* 🔥 SUBMIT CRAFT                   */
    /* ================================= */
    if (action === "submitCraft") {

      const { items } = body

      if (!Array.isArray(items)) {
        return NextResponse.json({ error: "Invalid items payload" }, { status: 400 })
      }

      for (const item of items) {

        const { from, to, amount } = item

        if (!from || !to || !amount) continue

        // 🔹 FIND STOCK IDS BY NAME
        const { data: fromStock } = await supabase
          .from("stock_items")
          .select("id, current_amount")
          .eq("name", from)

        const { data: toStock } = await supabase
          .from("stock_items")
          .select("id, current_amount")
          .eq("name", to)

        if (!fromStock?.length || !toStock?.length) continue

        // 🔥 CALCULATE TOTAL NEEDED (LIKE BUY DOES)
        const { data: targets } = await supabase
          .from("stock_items")
          .select("id, current_amount, goal_amount")
          .eq("name", to)

        if (!targets?.length) continue

        let totalNeeded = 0


        targets.forEach(t => {
          const current = t.current_amount || 0
          const goal = t.goal_amount || 0

          if (current < goal) {
            totalNeeded += (goal - current)
          }
        });

        if (totalNeeded <= 0) continue

        // 🔥 GET CONVERSION RATIO
        const { data: conversions } = await supabase
          .from("item_conversions_v2")
          .select("*")

        // 🔥 MATCH BY STOCK NAMES DIRECTLY (SAFE + SIMPLE)
        const conversion = conversions?.find(c =>
          c.from_item_id && c.to_item_id &&
          c.from_item_id === fromStock?.[0]?.id &&
          c.to_item_id === toStock?.[0]?.id
        )

        const ratio = conversion
          ? conversion.from_quantity / conversion.to_quantity
          : 1

        let remaining = Math.ceil(totalNeeded * ratio)


        // 🔹 SUBTRACT FROM SOURCE (ONLY WHAT EXISTS)
        for (const f of fromStock) {

          if (remaining <= 0) break

          const current = f.current_amount || 0

          if (current <= 0) continue

          const take = Math.min(current, remaining)

          await supabase
            .from("stock_items")
            .update({
              current_amount: current - take
            })
            .eq("id", f.id)

          remaining -= take
        }



        // 🔹 ADD TO TARGET (FIXED)
        let remainingAdd = totalNeeded

        for (const t of toStock) {

          if (remainingAdd <= 0) break

          const current = t.current_amount || 0

          const { data: stock } = await supabase
            .from("stock_items")
            .select("goal_amount")
            .eq("id", t.id)
            .single()

          const goal = stock?.goal_amount || Infinity

          const space = goal - current

          if (space <= 0) continue

          const add = Math.min(space, remainingAdd)

          await supabase
            .from("stock_items")
            .update({
              current_amount: current + add
            })
            .eq("id", t.id)

          remainingAdd -= add
        }

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

    if (action === "submitUsage") {
      const { usage, newStock } = body;

      for (const id in newStock) {
        const newValueRaw = newStock[id];
        const newValue = Number(newValueRaw);
        const used = usage?.[id] || 0;

        // 🚫 skip invalid
        if (isNaN(newValue)) continue;

        // ✅ ALWAYS update stock if user changed it
        await supabase
          .from("stock_items")
          .update({ current_amount: Math.max(0, newValue) })
          .eq("id", id);

        // ✅ ONLY log usage if something was actually used
        if (used > 0) {
          await supabase.from("stock_usage").insert({
            item_id: id,
            amount_used: used,
            recorded_stock: newValue, // ✅ ADD THIS
            created_at: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === "getRestockHistory") {
      const { data } = await supabase
        .from("stock_restock_log")
        .select("*");

      return NextResponse.json(data || []);
    }

    /* ================================= */
    /* 🔥 GET ANALYTICS (ADD THIS HERE)  */
    /* ================================= */
    if (action === "getAnalytics") {

      const { data: items } = await supabase
        .from("stock_items")
        .select("*");

      const { data: usage } = await supabase
        .from("stock_usage")
        .select("*");

      const { data: prices } = await supabase
        .from("stock_restock_log")
        .select("*"); // 👈 THIS IS YOUR PRICE HISTORY

      return NextResponse.json({
        items: items ?? [],
        usage: usage ?? [],
        prices: prices ?? [] // 👈 ADD THIS
      });
    }

    /* ================================= */
    /* DEFAULT                           */
    /* ================================= */
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Inventory API Error:", error);

    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
  }

