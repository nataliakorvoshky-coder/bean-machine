import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request){

  try{

    const body = await req.json()
    const { action } = body


    /* ================================= */
    /* GET STOCK ITEMS                   */
    /* ================================= */

    if(action === "getStockItems"){

      const { data, error } = await supabase
        .from("stock_items")
        .select("*")
        .order("name")

      if(error) throw error

      return NextResponse.json(data ?? [])

    }


    /* ================================= */
    /* GET RESTOCK NEEDED                */
    /* ================================= */

    if(action === "getRestockNeeded"){

      const { data, error } = await supabase
        .from("item_conversion")
        .select(`
          stock_item_id,
          external_stock_item_id,
          external_quantity,
          stock_quantity,
          stock_item:stock_item_id(
            id,
            name,
            current_amount,
            goal_amount
          ),
          external_stock:external_stock_item_id(
            name
          )
        `)

      if(error) throw error

      const grouped:any = {}

      data?.forEach((row:any)=>{

        const current = row.stock_item?.current_amount ?? 0
        const goal = row.stock_item?.goal_amount ?? 0

        const missing = Math.max(goal - current,0)

        if(missing <= 0) return

        const key = row.external_stock.name

        if(!grouped[key]){

          grouped[key] = {
            external_name: row.external_stock.name,
            needed_stock: 0,
            stock_ids: [],
            conversion: row
          }

        }

        grouped[key].needed_stock += missing
        grouped[key].stock_ids.push(row.stock_item_id)

      })


      const results:any[] = []


      Object.values(grouped).forEach((item:any)=>{

        const conversion = item.conversion

        const ratio =
          conversion.stock_quantity /
          conversion.external_quantity

        const needed_external = Math.ceil(
          item.needed_stock / ratio
        )

        const perStock = Math.floor(
          item.needed_stock / item.stock_ids.length
        )

        results.push({

          external_name:item.external_name,
          needed_external,

          stock_ids:item.stock_ids,

          needed_stock:Array(item.stock_ids.length)
            .fill(perStock)

        })

      })

      return NextResponse.json(results)

    }


    /* ================================= */
    /* SUBMIT RESTOCK                    */
    /* ================================= */

    if(action === "submitRestock"){

      const { items } = body

      if(!Array.isArray(items)){
        return NextResponse.json(
          { error:"Invalid items" },
          { status:400 }
        )
      }

      for(const item of items){

        const { stock_id, needed_stock } = item

        const { data:current } = await supabase
          .from("stock_items")
          .select("current_amount")
          .eq("id",stock_id)
          .single()

        if(!current || typeof current.current_amount !== "number"){
          continue
        }

        await supabase
          .from("stock_items")
          .update({
            current_amount: current.current_amount + needed_stock
          })
          .eq("id",stock_id)

      }

      return NextResponse.json({ success:true })

    }


    /* ================================= */
    /* GET EXTERNAL STOCK                */
    /* ================================= */

    if(action === "getExternalStock"){

      const { data, error } = await supabase
        .from("external_stock")
        .select("*")
        .order("name")

      if(error) throw error

      return NextResponse.json(data ?? [])

    }


    /* ================================= */
    /* ADD EXTERNAL STOCK                */
    /* ================================= */

    if(action === "addExternalStock"){

      const { name, price } = body

      const { error } = await supabase
        .from("external_stock")
        .insert([{ name, price }])

      if(error) throw error

      return NextResponse.json({ success:true })

    }


    /* ================================= */
    /* DELETE EXTERNAL STOCK             */
    /* ================================= */

    if(action === "deleteExternalStock"){

      const { id } = body

      const { error } = await supabase
        .from("external_stock")
        .delete()
        .eq("id",id)

      if(error) throw error

      return NextResponse.json({ success:true })

    }


    /* ================================= */
    /* CREATE CONVERSION                 */
    /* ================================= */

    if(action === "createConversion"){

      const {
        externalStockId,
        stockItemId,
        externalQuantity,
        stockQuantity
      } = body

      const { error } = await supabase
        .from("item_conversion")
        .insert([{
          external_stock_item_id: externalStockId,
          stock_item_id: stockItemId,
          external_quantity: externalQuantity,
          stock_quantity: stockQuantity
        }])

      if(error) throw error

      return NextResponse.json({ success:true })

    }


    /* ================================= */
    /* GET CONVERSIONS                   */
    /* ================================= */

    if(action === "getConversions"){

      const { data, error } = await supabase
        .from("item_conversion")
        .select(`
          id,
          external_quantity,
          stock_quantity,
          external_stock:external_stock_item_id(name),
          stock_item:stock_item_id(name)
        `)

      if(error) throw error

      return NextResponse.json(data ?? [])

    }


    /* ================================= */
    /* DELETE CONVERSION                 */
    /* ================================= */

    if(action === "deleteConversion"){

      const { id } = body

      const { error } = await supabase
        .from("item_conversion")
        .delete()
        .eq("id",id)

      if(error) throw error

      return NextResponse.json({ success:true })

    }


    return NextResponse.json(
      { error:"Invalid action" },
      { status:400 }
    )

  }catch(error:any){

    console.error("Inventory API Error:",error)

    return NextResponse.json(
      { error:error.message },
      { status:500 }
    )

  }

}