"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"


type BuyItem = {
  name: string

  amount: number

  produced_internal: number

  breakdown: {
    stock_id: string
    needed: number
  }[]
}

export default function RestockingPage(){

const [buyItems,setBuyItems] = useState<BuyItem[]>([])
const [craftItems,setCraftItems] = useState<any[]>([])
const [selectedCraft,setSelectedCraft] = useState<{[key:number]:boolean}>({})
  const [prices,setPrices] = useState<{[key:string]:number}>({})
  const [loading,setLoading] = useState(true)
  const [currentUsername,setCurrentUsername] = useState("")
const [currentEmployeeName,setCurrentEmployeeName] = useState("")

useEffect(()=>{

  loadRestock()
  loadCurrentUser()

},[])

async function loadCurrentUser(){

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if(!user) return

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      username,
      employee_id,
      employees(name)
    `)
    .eq("id", user.id)
    .maybeSingle()

  if(profile?.username){
    setCurrentUsername(profile.username)
  }

  const employeeName =
    (profile as any)?.employees?.name || ""

  setCurrentEmployeeName(employeeName)
}

async function loadRestock(){

  try{

    const res = await fetch(
      "/api/restock/get",
      {
        cache: "no-store"
      }
    )

    const data =
      await res.json()

    setBuyItems(
      Array.isArray(data?.buy)
        ? data.buy
        : []
    )

    setCraftItems(
      Array.isArray(data?.craft)
        ? data.craft
        : []
    )

  }catch(err){

    console.error(
      "Restock load error:",
      err
    )

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

payload.push({

  name:
    item.name,

  stock_ids:
    (item.breakdown || [])
      .map(
        (b:any) =>
          b.stock_id
      ),

  breakdown:
    item.breakdown || [],

  needed_stock:
    (item.breakdown || [])
      .reduce(
        (sum:any, b:any) =>
          sum + b.needed,
        0
      ),

  produced_internal:
    item.produced_internal,

  external_quantity:
    item.amount,

  price_each:
    price
})

})


    if(payload.length === 0){
      alert("Enter a price for at least one item")
      return
    }

    console.log(
  "RESTOCK PAYLOAD:",
  payload
)

const res = await fetch(
  "/api/restock/submit",
  {
    method:"POST",
    headers:{
      "Content-Type":
        "application/json"
    },
    body:JSON.stringify({
      items:payload
    })
  }
)

const data = await res.json()

if (res.ok) {

const restockDetails = payload.map(
  (item) => ({

    name:
      item.name,

    amount:
      item.external_quantity
  })
)

await fetch("/api/activity", {

  method: "POST",

  headers: {
    "Content-Type":
      "application/json",
  },

  body: JSON.stringify({

    action:
      `Restocked ${restockDetails.length} items`,

    type:
      "inventory_restock",

    username:
      currentUsername,

    employeeName:
      currentEmployeeName,

    details:
      restockDetails
  }),
})

const processed = data.processed || []

setPrices(prev => {
  const updated = { ...prev }

  processed
    .filter((name: any) => typeof name === "string")
    .forEach((name: string) => {
      delete updated[name.trim()]
    })

  return updated
})

await loadRestock()

  // 🔥 THIS FIXES OVERVIEW PAGE
window.dispatchEvent(
  new Event("inventory-refresh")
)

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

const res = await fetch(
  "/api/craft/submit",
  {
    method:"POST",
    headers:{
      "Content-Type":
        "application/json"
    },
    body:JSON.stringify({
      items:selected
    })
  }
)
if(res.ok){

const craftDetails = selected.map(
  (item) => ({

    name:
      `${item.from} → ${item.to}`,

    amount:
      item.amount
  })
)

await fetch("/api/activity", {

  method: "POST",

  headers: {
    "Content-Type":
      "application/json",
  },

  body: JSON.stringify({

    action:
      `Crafted ${craftDetails.length} items`,

    type:
      "inventory_craft",

    username:
      currentUsername,

    employeeName:
      currentEmployeeName,

    details:
      craftDetails
  }),
})

/* ✅ GET CHECKED ROW INDEXES */
const selectedIndexes =
  Object.keys(selectedCraft)
    .filter(key =>
      selectedCraft[Number(key)]
    )
    .map(Number)

/* ✅ REMOVE ROWS IMMEDIATELY */
setCraftItems(prev =>
  prev.filter(
    (_, index) =>
      !selectedIndexes.includes(index)
  )
)

/* ✅ CLEAR CHECKBOXES */
setSelectedCraft({})

/* ✅ REFRESH OVERVIEW PAGE */
window.dispatchEvent(
  new Event("inventory-refresh")
)

localStorage.setItem(
  "inventory_refresh",
  Date.now().toString()
)


}else{

    alert("Error applying craft")
  }
}


  return(

   <div className="max-w-7xl mx-auto px-8 py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Restocking Planner
      </h1>


{!(buyItems.length === 0 && craftItems.length === 0) && (

<>

<div
  className="
    grid
    grid-cols-4
    items-center
    gap-6

    px-10
    mb-3

    text-emerald-700
    font-semibold
    text-lg
  "
>

  <div>
    Buy Item
  </div>

  <div className="text-center whitespace-nowrap">
    Qty Needed
  </div>

  <div className="text-center whitespace-nowrap">
    Price Each
  </div>

  <div className="text-right whitespace-nowrap">
    Total
  </div>

</div>

{buyItems.length === 0 && (
  <div className="p-6 text-gray-500 text-sm">
    No items need restocking
  </div>
)}

{buyItems.map((item, i) => (

<motion.div
  key={item.name}
  initial={{
    opacity: 0,
    y: 4
  }}
  animate={{
    opacity: 1,
    y: 0
  }}

className="
w-full
  grid
  grid-cols-4
  items-center

  gap-6

  bg-white
  border
  border-emerald-300
  rounded-2xl
  shadow-sm

  px-10
  py-3
  mb-4
"
>

{/* ITEM */}
<div className="pl-4 text-emerald-700 text-lg font-semibold">
  {item.name}
</div>

{/* QTY */}
<div className="flex justify-center">
  <span className="text-emerald-700 text-lg">
    {item.amount}
  </span>
</div>

{/* PRICE */}
<div className="flex justify-center">
  <input
    type="number"
    value={prices[item.name] || ""}
    onChange={(e)=>
      updatePrice(
        item.name,
        Number(e.target.value)
      )
    }
    className="
      w-20
      h-10
      px-2
      border
      border-emerald-300
      rounded-lg
      text-center
      bg-transparent
    "
  />
</div>

{/* TOTAL */}
<div className="pr-4 text-right text-emerald-700 font-semibold text-xl">
  $
  {rowTotal(item).toFixed(2)}
</div>

</motion.div>

))}

<div className="flex items-center gap-6 mt-8 mb-20 px-6">

  {/* BUTTON */}
  <button
    onClick={submitRestock}
    disabled={!hasSelection}
className={`
  h-12
  px-6

      rounded-2xl
      text-white
      text-lg
      font-semibold

      shadow-md
      transition-all
      duration-200

      flex
      items-center
      justify-center

      w-fit

      ${
        hasSelection
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-gray-400 cursor-not-allowed"
      }
    `}
  >
    Submit Purchase & Update Inventory
  </button>

  {/* TOTAL CARD */}
  <div
    className="
      h-14

      flex
      items-center
      justify-between

      px-6

      rounded-2xl
      border
      border-emerald-200

      bg-white
      shadow-sm

      w-[300px]
    "
  >

    <span className="text-emerald-700 font-semibold text-lg">
      Total Purchase Cost:
    </span>

    <span className="text-emerald-600 font-bold text-2xl">
      ${totalCost().toFixed(2)}
    </span>

  </div>

</div>

<div className="h-24"></div>

</>

)}

{/* =========================
    CRAFT SECTION
========================= */}

<div className="pt-20">

{craftItems.length > 0 ? (
  <>
    <h2 className="text-2xl font-bold text-blue-700 mb-6">
      Craft Required
    </h2>

{craftItems.length === 0 && buyItems.length === 0 && (

  <div className="flex flex-col items-center py-20">

<img
  src="/norestock.png"
  alt="Happy Panda"
  className="
    w-[235px]
    relative
    z-10
    -mt-20
  "
/>

    <div className="mt-6 text-6xl font-bold text-emerald-700">
      Everything Fully Stocked ✨
    </div>

  </div>

)}


{craftItems.map((item:any,i:number)=>(

<motion.div
  key={i}
  initial={{
    opacity: 0,
    y: 4
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  transition={{
    delay: i * 0.03
  }}
>

<div
  className="
    w-full
    grid
    grid-cols-3
    items-center

    bg-white
    border
   border-emerald-300
    rounded-2xl
    shadow-sm

    px-8
    py-3
    mb-4
  "
>

  {/* ITEM */}
  <div className="pl-4 text-blue-700 text-lg font-semibold">
    {item.from} → {item.to}
  </div>

  {/* CHECKBOX */}
  <div className="flex justify-center">
    <input
      type="checkbox"
      checked={!!selectedCraft[i]}
      onChange={(e) =>
        setSelectedCraft((prev) => ({
          ...prev,
          [i]: e.target.checked,
        }))
      }
      className="w-5 h-5 accent-blue-600"
    />
  </div>

{/* AMOUNT */}
<div className="relative h-full">
  <span
    className="
      absolute
      right-10
      top-1/2
      -translate-y-1/2
      text-blue-700
      font-bold
      text-xl
    "
  >
    {item.amount}
  </span>
</div>

</div>


</motion.div>

))}


{/* CRAFT BUTTON */}
<div className="flex justify-start mt-8 px-6">

  <button
    onClick={submitCraft}
    disabled={!Object.values(selectedCraft).some(v => v)}

    className={`
      h-12
      px-6

      rounded-2xl
      text-white
      text-base
      font-semibold

      shadow-md
      transition-all
      duration-200

      flex
      items-center
      justify-center

      w-fit

      ${
        craftItems.length
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-400 cursor-not-allowed"
      }
    `}
  >
    Submit Craft & Update Inventory
  </button>

</div>
  
  </>
) : buyItems.length === 0 ? (

<div className="relative flex flex-col items-center justify-start pt-10 min-h-[700px] overflow-visible isolate">

<div className="fireworks">

  {[...Array(4)].map((_, burstIndex) => (

    <div
      key={burstIndex}
      className="firework-burst"
style={{
  left: `${32 + Math.random() * 48}%`,
  top: `${10 + Math.random() * 18}%`,
  animationDelay: `${burstIndex * 1.2}s`
}}
    >

      {[...Array(40)].map((_, i) => {

        const angle = Math.random() * 360
        const distance = 80 + Math.random() * 90

        return (

<div
  key={i}
  className="firework-particle"
  style={{
    '--angle': `${angle}deg`,
    '--distance': `${80 + Math.random() * 120}px`,
    '--fall': `${80 + Math.random() * 140}px`,
'--delay': `${Math.random() * 0.35}s`,
    '--drift': `${Math.random() * 120 - 60}px`,
    '--color': [
      '#60a5fa',
      '#f472b6',
      '#facc15',
      '#34d399',
      '#ffffff'
    ][Math.floor(Math.random() * 5)]
  } as React.CSSProperties}
>

  <span className="rocket"></span>

  <span className="burst"></span>

  <span className="ember"></span>

</div>
        )

      })}

    </div>

  ))}

</div>

  {/* PANDA */}
<img
  src="/norestock.png"
  alt="Happy Panda"
className="
  w-[235px]
  relative
  z-10
 -mt-2
"
/>

  {/* TEXT */}
 <div className="mt-3 text-[1.5rem] font-bold text-emerald-700 relative z-10 text-center">
    Everything Fully Stocked ✨
  </div>

</div>

) : null}

      </div> 
      </div>


  )

}