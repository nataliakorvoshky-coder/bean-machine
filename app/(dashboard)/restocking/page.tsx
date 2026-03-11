"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type StockItem={
id:string
name:string
current_amount:number
goal_amount:number
}

type Conversion={
stock_item_id:string
purchase_name:string
units_per_purchase:number
price_per_purchase:number
}

export default function RestockingPage(){

const [items,setItems] = useState<StockItem[]>([])
const [conv,setConv] = useState<Conversion[]>([])
const [qty,setQty] = useState<Record<string,number>>({})

async function load(){

const {data:stock} = await supabase
.from("stock_items")
.select("*")

const {data:convData} = await supabase
.from("restock_conversion")
.select("*")

setItems(stock || [])
setConv(convData || [])

}

useEffect(()=>{load()},[])

function need(i:StockItem){
return Math.max(i.goal_amount - i.current_amount,0)
}

function status(i:StockItem){

if(i.current_amount < i.goal_amount)
return {text:"LOW",color:"text-red-600 bg-red-100"}

if(i.current_amount === i.goal_amount)
return {text:"MET",color:"text-emerald-700 bg-emerald-100"}

return {text:"OVER",color:"text-blue-600 bg-blue-100"}

}

function buyAmount(i:StockItem){

const c = conv.find(x=>x.stock_item_id===i.id)
if(!c) return 0

return Math.ceil(need(i)/c.units_per_purchase)

}

function cost(i:StockItem){

const c = conv.find(x=>x.stock_item_id===i.id)
if(!c) return 0

const q = qty[i.id] ?? buyAmount(i)

return q * c.price_per_purchase

}

function quickFill(i:StockItem){

setQty({
...qty,
[i.id]:buyAmount(i)
})

}

async function submit(){

for(const i of items){

const c = conv.find(x=>x.stock_item_id===i.id)
if(!c) continue

const q = qty[i.id] ?? buyAmount(i)
if(q===0) continue

const added = q * c.units_per_purchase
const costTotal = q * c.price_per_purchase

await supabase
.from("stock_items")
.update({
current_amount:i.current_amount + added
})
.eq("id",i.id)

await supabase.from("restock_orders").insert({
stock_item_id:i.id,
purchase_name:c.purchase_name,
purchase_qty:q,
units_added:added,
cost:costTotal
})

}

load()

}

const total = items.reduce((sum,i)=>sum + cost(i),0)

return(

<div className="max-w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-6">
Restocking Forecast
</h1>

<div className="bg-white p-4 rounded-xl shadow">

<div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr] text-xs font-semibold text-emerald-700 border-b pb-2">

<div>Item</div>
<div>Current</div>
<div>Goal</div>
<div>Status</div>
<div>Purchase Item</div>
<div>Buy</div>
<div>Cost</div>

</div>

{items.map(i=>{

const c = conv.find(x=>x.stock_item_id===i.id)
if(!c) return null

const s = status(i)
const buy = buyAmount(i)

return(

<div
key={i.id}
className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr] py-2 border-b border-emerald-100 text-sm items-center"
>

<div className="text-emerald-700">
{i.name}
</div>

<div>{i.current_amount}</div>

<div>{i.goal_amount}</div>

<div>

<span
className={
"px-2 py-[2px] rounded-full text-[11px] font-medium " + s.color
}
>
{s.text}
</span>

</div>

<div>{c.purchase_name}</div>

<div className="flex gap-2 items-center">

<input
type="number"
value={qty[i.id] ?? buy}
onChange={e=>setQty({...qty,[i.id]:Number(e.target.value)})}
className="w-[60px] border border-emerald-300 rounded text-center focus:ring-2 focus:ring-emerald-500"
/>

<button
onClick={()=>quickFill(i)}
className="text-xs text-emerald-600"
>
auto
</button>

</div>

<div className="font-medium">
${cost(i)}
</div>

</div>

)

})}

<div className="flex justify-between mt-4">

<div className="font-semibold text-emerald-700">
Estimated Purchase Cost
</div>

<div className="font-semibold text-emerald-700">
${total}
</div>

</div>

<button
onClick={submit}
className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
>
Submit Restock Order
</button>

</div>

</div>

)

}