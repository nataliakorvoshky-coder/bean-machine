"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API = "/api/inventory"

type BuyItem = {
  name: string
  amount: number
  breakdown: {
    stock_id: string
    needed: number
  }[]
}

export default function RestockingPage(){
  const router = useRouter()

const [buyItems,setBuyItems] = useState<BuyItem[]>([])
const [craftItems,setCraftItems] = useState<any[]>([])
const [selectedCraft,setSelectedCraft] = useState<{[key:number]:boolean}>({})
  const [prices,setPrices] = useState<{[key:string]:number}>({})
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadRestock()
  },[])

  async function loadRestock(){

    try{

      const res = await fetch(API,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          action:"getRestockNeeded"
        })
      })

const data = await res.json()

setBuyItems(data.buy || [])
setCraftItems(data.craft || [])

    }catch(err){
      console.error("Restock load error:", err)
      setBuyItems([])
setCraftItems([])
    }

    setLoading(false)
  }

function updatePrice(name:string,value:number){

  const key = name.trim() // ✅ normalize

  setPrices(prev=>({
    ...prev,
    [key]:value
  }))
}

function rowTotal(item:any){
  const price = prices[item.name.trim()] ?? 0
  return price * item.amount
}

function totalCost(){
  return buyItems.reduce((sum,item)=>{
   const price = prices[item.name.trim()] ?? 0
    return sum + price * item.amount
  },0)
}

  const hasSelection = Object.values(prices).some(v => v > 0)

  async function submitRestock(){

    const payload:any[] = []

   buyItems.forEach(item => {

const price = prices[item.name.trim()]

      // ✅ ONLY submit selected items
      if (!price || price <= 0) return

(item.breakdown || []).forEach((b:any) => {

payload.push({
  stock_id: b.stock_id,
  needed_stock: b.needed,
  price_each: price // 🔥 THIS IS THE FIX
})

})

    })

    if(payload.length === 0){
      alert("Enter a price for at least one item")
      return
    }

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        action:"submitRestock",
        items:payload
      })
    })

if(res.ok){

  setPrices({})

  // 🔥 FORCE FRESH DATA (NO CACHE)
await loadRestock()
localStorage.setItem("inventory_refresh", Date.now().toString())

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

  async function submitCraft(){

const selected = craftItems
  .filter((_,i)=>selectedCraft[i])
  .map(item => ({
    from: item.from,
    to: item.to,
    amount: Number(item.amount) // ✅ force full current value
  }))

  console.log("CRAFT SUBMIT:", selected)

if(selected.length === 0){
  alert("Select at least one craft item")
  return
}

const res = await fetch(API,{
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body:JSON.stringify({
    action:"submitCraft",
    items: selected
  })
})

  if(res.ok){

  await loadRestock()

localStorage.setItem("inventory_refresh", Date.now().toString())

  }else{
    alert("Error applying craft")
  }
}

  return(

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Restocking Planner
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-4 px-6 py-4 text-sm font-semibold text-emerald-700 border-b">
          <div>Buy Item</div>
          <div className="text-center">Qty Needed</div>
          <div className="text-center">Price Each</div>
          <div className="text-right">Total</div>
        </div>

        {buyItems.length === 0 && (
          <div className="p-6 text-gray-500 text-sm">
            No items need restocking
          </div>
        )}

        {buyItems.map(item=>(

          <div
            key={item.name.trim()}
            className="grid grid-cols-4 px-6 py-4 text-sm border-b items-center"
          >

            <div className="text-emerald-700 font-medium">
              {item.name}
            </div>

            <div className="text-center">
              {item.amount}
            </div>

            <div className="flex justify-center">
              <input
                type="number"
value={prices[item.name.trim()] ?? ""}
onChange={(e)=>updatePrice(
  item.name,
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
          disabled={!hasSelection}
          className={`px-6 py-3 rounded text-white ${
            hasSelection
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Purchase & Update Inventory
        </button>

        <div className="text-lg font-semibold text-emerald-700">
          Total Purchase Cost: ${totalCost().toFixed(2)}
        </div>
      </div>

      <h2 className="text-xl font-bold text-blue-700 mt-10 mb-4">
  Craft Required
</h2>

<div className="bg-white rounded-xl shadow overflow-hidden">

  {craftItems.length === 0 && (
    <div className="p-6 text-gray-500 text-sm">
      No crafting needed
    </div>
  )}

{craftItems.map((item:any,i:number)=>(

  <div
    key={i}
    className="flex justify-between items-center px-6 py-3 border-b text-sm"
  >

    {/* ✅ CHECKBOX */}
    <input
      type="checkbox"
      checked={!!selectedCraft[i]}
      onChange={(e)=>{
        setSelectedCraft(prev => ({
          ...prev,
          [i]: e.target.checked
        }))
      }}
    />

    <span className="text-blue-700 flex-1 ml-3">
      {item.from} → {item.to}
    </span>

    <span>
      {item.amount}
    </span>

  </div>
))}

</div>

{/* ✅ CRAFT BUTTON HERE */}
<div className="mt-4 flex justify-end">

  <button
    onClick={submitCraft}
    disabled={!Object.values(selectedCraft).some(v => v)}
    className={`px-6 py-3 rounded text-white ${
      craftItems.length
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-gray-400 cursor-not-allowed"
    }`}
  >
    Submit Craft & Update Inventory
  </button>

</div>

      </div>

  )

}