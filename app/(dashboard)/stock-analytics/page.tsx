"use client"

import { useEffect, useState } from "react"

const HIDDEN_ITEMS = [
  "Macchiato",
  "Coffee",
  "Milk Foam",
  "Mocha",
  "Cappuccino",
  "Espresso",
  "Frappucino",
  "Iced Coffee",
  "Latte",
  "Batter"
]

type StockItem = {
  id: string
  name: string
  current_amount: number
  goal_amount: number
}

type GroupedItem = {
  name: string
  ids: string[]
  goal_amount: number
  current_amount: number
}

export default function StockAnalytics(){

  const [items,setItems] = useState<StockItem[]>([])
  const [loading,setLoading] = useState(true)
  const [usageData,setUsageData] = useState<any[]>([])
  const [restocks,setRestocks] = useState<any[]>([])
  const [priceHistory,setPriceHistory] = useState<any[]>([])
  const [expanded,setExpanded] = useState<string | null>(null)

  useEffect(()=>{ loadData() },[])

async function loadData(){
  try{

const res = await fetch(
  "/api/analytics/overview",
  {
    cache:"no-store"
  }
)
    const data = await res.json()

setItems(
  Array.isArray(data?.items)
    ? data.items
    : []
)

setUsageData(
  Array.isArray(data?.usage)
    ? data.usage
    : []
)

const restockRes = await fetch(
  "/api/analytics/restocks",
  {
    cache:"no-store"
  }
)

    const restockData = await restockRes.json()
setRestocks(
  Array.isArray(
    restockData?.restocks
  )
    ? restockData.restocks
    : []
)

setPriceHistory(
  Array.isArray(
    restockData?.restocks
  )
    ? restockData.restocks
    : []
)

  }catch(err){
    console.error(err)
    setItems([])
  }

  setLoading(false)
}

  // ===== SUMMARY =====

  function totalItems(){ return items.length }

  function lowStock(){
    return items.filter(i => i.current_amount < i.goal_amount)
  }

  function totalUnits(){
    return items.reduce((sum,i)=> sum + i.current_amount,0)
  }

  // ===== COST =====

  function getWeeklySpend(){
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate()-7)

    return restocks
      .filter(r => new Date(r.created_at) >= weekAgo)
      .reduce(

  (s,r)=>

    s +

    Number(
      r.total_cost || 0
    ),

  0
)
  }

  function getMonthlySpend(){
    const now = new Date()
    return restocks.filter(r=>{
      const d = new Date(r.created_at)
      return d.getMonth()===now.getMonth() &&
             d.getFullYear()===now.getFullYear()
    }).reduce(

  (s,r)=>

    s +

    Number(
      r.total_cost || 0
    ),

  0
)
  }

  function getYearlySpend(){
    const now = new Date()
    return restocks
      .filter(r => new Date(r.created_at).getFullYear()===now.getFullYear())
      .reduce(

  (s,r)=>

    s +

    Number(
      r.total_cost || 0
    ),

  0
)
  }

  function getDailySpend(){
  const today = new Date().toISOString().split("T")[0]

  return restocks
    .filter(r => r.created_at.startsWith(today))
    .reduce(

  (sum,r)=>

    sum +

    Number(
      r.total_cost || 0
    ),

  0
)
}

// ===== PRICE =====

function avgPrice(id:string){
  const list = priceHistory.filter(p => p.stock_item_id === id)
  if (!list.length) return 0

  return (
    list.reduce(

  (s,p)=>

    s +

    Number(
      p.price_each || 0
    ),

  0
) / list.length
  )
}

function dailyItemSpend(id:string){
  const today = new Date().toISOString().split("T")[0]

  return priceHistory
    .filter(p =>
      p.stock_item_id === id &&
      p.created_at.startsWith(today)
    )
    .reduce(

  (s,p)=>

    s +

    Number(
      p.total_cost || 0
    ),

  0
)
}

function priceTrend(id:string){
  const now = new Date()

  const last7 = priceHistory.filter(p=>{
    const d = new Date(p.created_at)
    return p.stock_item_id === id &&
      d >= new Date(now.getTime()-7*86400000)
  })

  const prev7 = priceHistory.filter(p=>{
    const d = new Date(p.created_at)
    return p.stock_item_id === id &&
      d >= new Date(now.getTime()-14*86400000) &&
      d < new Date(now.getTime()-7*86400000)
  })

  const avg = (arr:any[]) =>
    arr.length ? arr.reduce(

  (s,p)=>

    s +

    Number(
      p.price_each || 0
    ),

  0
)/arr.length : 0

  return avg(last7) - avg(prev7)
}

  // ===== USAGE =====

  function weeklyUsage(id:string){
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate()-7)

    return usageData
      .filter(u => u.item_id===id && new Date(u.created_at)>=weekAgo)
      .reduce((s,u)=> s + u.amount_used,0)
  } 

  function dailyUsage(id:string){
  const today = new Date().toISOString().split("T")[0]

  return usageData
    .filter(u => 
      u.item_id === id &&
      u.created_at.startsWith(today)
    )
    .reduce((sum,u)=> sum + u.amount_used,0)
}

function avgDailyUsage(id:string){
  const list = usageData.filter(u => u.item_id === id)
  if (!list.length) return 0

  return (
    list.reduce((sum,u)=> sum + u.amount_used,0) / list.length
  )
}

function monthlyUsage(id: string) {
  const now = new Date()
  const monthAgo = new Date()
  monthAgo.setDate(now.getDate() - 30)

  return usageData
    .filter(u => {
      const d = new Date(u.created_at)
      return u.item_id === id && d >= monthAgo
    })
    .reduce((s, u) => s + u.amount_used, 0)
}

  function usageTrend(id:string){
    const now = new Date()

    const last7 = weeklyUsage(id)

    const prev7 = usageData.filter(u=>{
      const d = new Date(u.created_at)
      return u.item_id===id &&
        d >= new Date(now.getTime() - 14*86400000) &&
        d < new Date(now.getTime() - 7*86400000)
    }).reduce((s,u)=> s + u.amount_used,0)

    return last7 - prev7
  }

  // ===== GOALS =====

  function suggestedGoal(id:string){
    const weekly = weeklyUsage(id)
    if(weekly===0) return 0
    return Math.ceil(weekly * 1.25)
  }

  function updateGoals(){
    const updated = items.map(i=>({
      ...i,
      goal_amount: suggestedGoal(i.id)
    }))
    setItems(updated)
  }

  // ===== SPARKLINE =====

  function getSparklineData(itemId:string){
    const days = 7
    const now = new Date()
    const result:number[] = []

    for(let i = days - 1; i >= 0; i--){
      const day = new Date(now)
      day.setDate(now.getDate() - i)

      const total = usageData
        .filter(u=>{
          const d = new Date(u.created_at)
          return (
            u.item_id === itemId &&
            d.toDateString() === day.toDateString()
          )
        })
        .reduce((s,u)=> s + u.amount_used,0)

      result.push(total)
    }

    return result
  }

  if(loading){
    return <div className="p-10 text-gray-500">Loading...</div>
  }

  // 🔥 GROUP ITEMS BY NAME (MERGE MILK, ETC)
const groupedItems: GroupedItem[] = Object.values(
  items.reduce<Record<string, GroupedItem>>((acc, item) => {
    const key = item.name.trim().toLowerCase()

    if (!acc[key]) {
      acc[key] = {
        name: item.name,
        ids: [],
        goal_amount: 0,
        current_amount: 0
      }
    }

    acc[key].ids.push(item.id)
    acc[key].goal_amount += item.goal_amount
    acc[key].current_amount += item.current_amount

    return acc
  }, {})
)

// 🔥 USE GROUPED DATA FOR MAX
const topUsage = Math.max(
  ...groupedItems.map((g: any) =>
    g.ids.reduce((sum: number, id: string) => sum + weeklyUsage(id), 0)
  ),
  1
)

function totalPlannerCost(){
  if (!restocks.length) return 0

  // sort newest first
  const sorted = [...restocks].sort(
    (a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // take newest batch (first X rows until timestamp changes too much)
  const firstTime = new Date(sorted[0].created_at).getTime()

  const batch = sorted.filter(r => {
    const t = new Date(r.created_at).getTime()
    return Math.abs(firstTime - t) < 10000 // 🔥 10s window (safe)
  })

  return batch.reduce(

  (sum,r)=>

    sum +

    Number(
      r.total_cost || 0
    ),

  0
)
}

function currentItemSpend(id: string){
  if (!restocks.length) return 0

  const sorted = [...restocks].sort(
    (a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const firstTime = new Date(sorted[0].created_at).getTime()

  return sorted
    .filter(r => {
      const t = new Date(r.created_at).getTime()
      return (
        r.stock_item_id === id &&
        Math.abs(firstTime - t) < 10000
      )
    })
    .reduce(

  (sum,r)=>

    sum +

    Number(
      r.total_cost || 0
    ),

  0
)
}

  return(

    <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">

      <h1 className="text-4xl font-bold text-emerald-700">
        Stock Analytics
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-6">

        <Card title="Total Items" value={totalItems()} />
        <Card title="Low Stock" value={lowStock().length} red />
        <Card title="Total Units" value={totalUnits()} />

<Card
  title="Daily Spend"
  value={`$${getDailySpend().toFixed(2)}`}
  red
/>

<Card
  title="Weekly Spend"
  value={`$${getWeeklySpend().toFixed(2)}`}
  red
/>

<Card
  title="Monthly Spend"
  value={`$${getMonthlySpend().toFixed(2)}`}
  red
/>

<Card
  title="Yearly Spend"
  value={`$${getYearlySpend().toFixed(2)}`}
  red
/>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={updateGoals}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Auto Update Goals
        </button>
      </div>

      {/* TABLE */}
      <div className="space-y-3">

        {/* HEADER */}
        <div
          className="px-6 py-3 text-xs font-semibold text-emerald-700 uppercase border-b border-emerald-200 bg-emerald-50"
style={{
  display: "grid",
  gridTemplateColumns: "4fr 1.2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
}}
        >
<div>Item</div>
<div>Goal</div>
<div>Daily</div>
<div>Weekly</div>
<div>Monthly</div>
<div>Avg $</div>
<div>Spark</div>
<div>Trend</div>
<div>Suggested</div>
        </div>

        {groupedItems
 .filter((item: GroupedItem) =>
    !HIDDEN_ITEMS.some(h =>
      h.toLowerCase().trim() === item.name.toLowerCase().trim()
    )
  )
  .map((item: GroupedItem) => {

const todayValue = item.ids.reduce(
  (s: number, id: string) => s + dailyUsage(id),
  0
)

const avgDaily =
  item.ids.reduce((s: number, id: string) => s + avgDailyUsage(id), 0) /
  (item.ids.length || 1)

const daily = expanded === item.name ? avgDaily : todayValue

const weekly = item.ids.reduce(
  (s: number, id: string) => s + weeklyUsage(id),
  0
)

const monthly = item.ids.reduce(
  (s: number, id: string) => s + monthlyUsage(id),
  0
)

const trend = item.ids.reduce(
  (s: number, id: string) => s + usageTrend(id),
  0
)

const avg =
  item.ids.reduce((s: number, id: string) => s + avgPrice(id), 0) /
  (item.ids.length || 1)

const spend = item.ids.reduce(
  (s: number, id: string) => s + currentItemSpend(id),
  0
)

const priceT = item.ids.reduce(
  (s: number, id: string) => s + priceTrend(id),
  0
)

const usageRatio = weekly / (topUsage || 1)

const isHigh = usageRatio > 0.75
const isMedium = usageRatio > 0.4 && usageRatio <= 0.75

const weeklySpend = spend
const monthlySpend = spend
const yearlySpend = spend

          return(
      
<div key={item.name} className="space-y-1">
<div
  onClick={() => setExpanded(expanded === item.name ? null : item.name)}
  style={{
    display: "grid",
    gridTemplateColumns: "4fr 1.2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
  }}
className={`grid grid-cols-[4fr_1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] 
rounded-xl shadow px-6 py-3 items-center cursor-pointer transition

hover:shadow-md hover:-translate-y-[1px]

${expanded === item.name ? "ring-2 ring-emerald-400" : ""}

${
  isHigh
    ? "bg-red-50 border border-red-300"
    : isMedium
    ? "bg-yellow-50 border border-yellow-300"
    : "bg-white border border-emerald-200"
}
`}
>

<div className="font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-[2px] rounded w-fit">
  {item.name}
</div>

              <div>{item.goal_amount}</div>

<div className="font-semibold">
  {daily ? (
    <span className="text-red-500">
      -{expanded === item.name ? daily.toFixed(1) : daily}
      {expanded === item.name && (
        <span className="text-xs text-gray-400 ml-1">(avg)</span>
      )}
    </span>
  ) : (
    <span className="text-emerald-300">–</span>
  )}
</div>

              <div className="font-semibold text-emerald-700">
               {weekly || <span className="text-emerald-300">–</span>}
              </div>

          <div>{monthly || <span className="text-emerald-300">–</span>}</div>

<div className="font-semibold text-emerald-700">
  ${avg ? avg.toFixed(2) : "–"}
</div>

<div className="font-semibold text-red-500">
  ${spend ? spend.toFixed(2) : "–"}
</div>

<div className={`font-semibold ${
  priceT > 0 ? "text-red-500" :
  priceT < 0 ? "text-emerald-600" :
  "text-emerald-300"
}`}>
  {priceT > 0 && "↑"}
  {priceT < 0 && "↓"}
  {priceT === 0 && "-"}
</div>

              

              <div className={`font-semibold ${
                (
  Math.ceil(
    item.ids.reduce((s: number, id: string) => s + weeklyUsage(id), 0) * 1.25
  ) - item.goal_amount
) > 0 ? "text-red-500" : "text-emerald-600"
              }`}>
                {Math.ceil(
  item.ids.reduce((s: number, id: string) => s + weeklyUsage(id), 0) * 1.25
)}
              </div>

</div>

{expanded === item.name && (
  <div className="bg-white mx-2 mb-2 rounded-xl shadow-inner px-6 py-4 border border-emerald-200">

    {/* ===== USAGE ===== */}
    <div className="grid grid-cols-4 gap-6 text-sm mb-4">

      <div>
        <div className="text-gray-500 text-xs">Daily Usage</div>
        <div className="font-semibold text-red-500">
          {todayValue || "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Weekly Usage</div>
        <div className="font-semibold text-emerald-700">
          {weekly || "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Monthly Usage</div>
        <div className="font-semibold text-emerald-700">
          {monthly || "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Avg Daily</div>
        <div className="font-semibold text-emerald-700">
          {avgDaily ? avgDaily.toFixed(1) : "–"}
        </div>
      </div>

    </div>

    {/* ===== COST ===== */}
    <div className="grid grid-cols-4 gap-6 text-sm">

      <div>
        <div className="text-gray-500 text-xs">Daily Spend</div>
        <div className="font-semibold text-red-500">
          ${spend ? spend.toFixed(2) : "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Weekly Spend</div>
        <div className="font-semibold text-red-500">
          ${weeklySpend ? weeklySpend.toFixed(2) : "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Monthly Spend</div>
        <div className="font-semibold text-red-500">
          ${monthlySpend ? monthlySpend.toFixed(2) : "–"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">Yearly Spend</div>
        <div className="font-semibold text-red-500">
          ${yearlySpend ? yearlySpend.toFixed(2) : "–"}
        </div>
      </div>

    </div>

    {/* CHART */}
    <div className="mt-4">
      <Sparkline
data={
  item.ids.length
    ? item.ids
        .map((id: string) => getSparklineData(id))
        .reduce((acc: number[], curr: number[]) =>
          acc.map((v, i) => v + (curr[i] || 0))
        )
    : []
}
/>
    </div>

  </div>
)}
</div>
)
   
        })}

      </div>

    </div>
  )
}

function Sparkline({data}:{data:number[]}){

  const max = Math.max(...data,1)

  return(
    <div className="flex items-end gap-[2px] h-6">
      {data.map((v,i)=>(
        <div
          key={i}
          style={{
            height: `${(v/max)*100}%`,
            width: "4px"
          }}
          className="bg-emerald-500 rounded-sm transition-all duration-300"
        />
      ))}
    </div>
  )
}

function Card({title,value,red=false}:any){
  return(
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${red ? "text-red-500":"text-emerald-700"}`}>
        {value}
      </div>
    </div>
  )
}