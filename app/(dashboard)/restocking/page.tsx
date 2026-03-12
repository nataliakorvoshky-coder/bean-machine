"use client"

import { useEffect, useState } from "react"

const API = "/api/inventory"

type RestockItem = {
  external_name:string
  needed_external:number
  stock_ids:string[]
  needed_stock:number[]
}

export default function RestockingPage(){

  const [items,setItems] = useState<RestockItem[]>([])
  const [prices,setPrices] = useState<{[key:string]:number}>({})
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadRestock()
  },[])

  async function loadRestock(){

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        action:"getRestockNeeded"
      })
    })

    const data = await res.json()

    if(!Array.isArray(data)){
      setItems([])
      setLoading(false)
      return
    }

    const grouped:any = {}

    data.forEach((row:any)=>{

      if(!grouped[row.external_name]){

        grouped[row.external_name] = {
          external_name:row.external_name,
          needed_external:row.needed_external,
          stock_ids:[row.stock_id],
          needed_stock:[row.needed_stock]
        }

      }else{

        grouped[row.external_name].needed_external += row.needed_external
        grouped[row.external_name].stock_ids.push(row.stock_id)
        grouped[row.external_name].needed_stock.push(row.needed_stock)

      }

    })

    setItems(Object.values(grouped))
    setLoading(false)

  }

  function updatePrice(name:string,value:number){

    setPrices(prev=>({
      ...prev,
      [name]:value
    }))

  }

  function rowTotal(item:RestockItem){

    const price = prices[item.external_name] ?? 0

    return price * item.needed_external

  }

  function totalCost(){

    let total = 0

    items.forEach(item=>{
      total += rowTotal(item)
    })

    return total

  }

  async function submitRestock(){

    const payload:any[] = []

    items.forEach(item=>{

      if(!Array.isArray(item.stock_ids)) return

      item.stock_ids.forEach((id,index)=>{

        payload.push({
          stock_id:id,
          needed_stock:item.needed_stock?.[index] ?? 0
        })

      })

    })

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        action:"submitRestock",
        items:payload
      })
    })

    if(res.ok){

      loadRestock()

    }else{

      alert("Error updating inventory")

    }

  }

  if(loading){

    return(
      <div className="p-10 text-gray-500">
        Loading restock planner...
      </div>
    )

  }

  return(

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Restocking Planner
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-4 px-6 py-4 text-sm font-semibold text-emerald-700 border-b">

          <div>Needed Item</div>
          <div className="text-center">Qty Needed</div>
          <div className="text-center">Price Each</div>
          <div className="text-right">Total</div>

        </div>

        {items.map(item=>(

          <div
            key={item.external_name}
            className="grid grid-cols-4 px-6 py-4 text-sm border-b items-center"
          >

            <div className="text-emerald-700 font-medium">
              {item.external_name}
            </div>

            <div className="text-center">
              {item.needed_external}
            </div>

            <div className="flex justify-center">

              <input
                type="number"
                value={prices[item.external_name] ?? ""}
                onChange={(e)=>updatePrice(
                  item.external_name,
                  Number(e.target.value)
                )}
                className="border border-emerald-300 rounded px-2 py-1 w-20 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>

            <div className="text-right text-emerald-700 font-medium">
              ${rowTotal(item).toFixed(2)}
            </div>

          </div>

        ))}

      </div>

      <div className="flex justify-between items-center mt-8">

        <button
          onClick={submitRestock}
          className="bg-emerald-600 text-white px-6 py-3 rounded hover:bg-emerald-700"
        >
          Submit Purchase & Update Inventory
        </button>

        <div className="text-lg font-semibold text-emerald-700">
          Total Purchase Cost: ${totalCost().toFixed(2)}
        </div>

      </div>

    </div>

  )

}