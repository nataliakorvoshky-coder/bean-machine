"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase";

const API = "/api/employee-analytics"

const HIDDEN_RANKS = [
  "coffee panda",
  "croissant",
  "frappuccino"
]

type EmployeeStats = {
  id: string
  employee_name: string
  name: string
  total_minutes: number
  weekly_minutes: number
  lifetime_hours?: number
  calculated_lifetime_hours?: number
  wage: number
  hire_date?: string
  last_promotion_date?: string
}

export default function EmployeeAnalytics(){

  const [employees,setEmployees] = useState<EmployeeStats[]>([])
  const [topEmployees,setTopEmployees] = useState<any[]>([])
  const [weekly,setWeekly] = useState<EmployeeStats[]>([])
  const [monthly,setMonthly] = useState<EmployeeStats[]>([])
  const [yearly,setYearly] = useState<EmployeeStats[]>([])
  const [promotions,setPromotions] = useState<EmployeeStats[]>([])
  const [snapshots,setSnapshots] = useState<any[]>([])
  const [snapIndex,setSnapIndex] = useState(0)

  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){
    try{
      const res = await fetch(API,{ method:"GET" })
      const data = await res.json()

      setEmployees(data.employees || [])
      setTopEmployees(data.topEmployees || [])
      setWeekly(data.weekly || [])
      setMonthly(data.monthly || [])
      setYearly(data.yearly || [])
      setPromotions(data.promotions || [])
      setSnapshots(groupSnapshots(data.snapshots || []))

    }catch(err){
      console.error(err)
      setEmployees([])
    }

    setLoading(false)
  }

  // 🔥 GROUP SNAPSHOTS BY WEEK
  function groupSnapshots(raw:any[]){
    const grouped:any = {}

    raw.forEach(s=>{
      const date = new Date(s.created_at).toDateString()

      if(!grouped[date]) grouped[date] = []
      grouped[date].push(s)
    })

    return Object.values(grouped)
  }

function formatHours(min:number = 0){

  const safeMinutes = Number(min) || 0

  const h = Math.floor(safeMinutes / 60)
  const m = safeMinutes % 60

  return `${h}h ${m}m`
}

  function earnings(min:number,wage:number){
    const hours = min / 60
    return (hours * wage).toFixed(2)
  }

  const performerBadges = {
  weekly: {
    label: "Top Weekly Performer",
    className:
      "bg-gradient-to-r from-emerald-300 to-emerald-500 text-white border border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
  },

  monthly: {
    label: "Top Monthly Performer",
    className:
      "bg-gradient-to-r from-sky-300 to-cyan-500 text-white border border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.45)]"
  },

  yearly: {
    label: "Top Yearly Performer",
    className:
      "bg-gradient-to-r from-violet-300 to-fuchsia-500 text-white border border-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.45)]"
  },

  lifetime: {
    label: "Top Lifetime Performer",
    className:
      "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-amber-900 border border-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.55)]"
  }
}

function isVisibleEmployee(emp: any) {

  // 🔥 HANDLE NORMAL EMPLOYEE ROWS
  const rank =
    emp.employee_ranks?.rank_name
      ?.toLowerCase()
      .trim() || ""

  // 🔥 HANDLE SNAPSHOT ROWS
  const name =
    emp.name?.toLowerCase().trim() ||
    emp.employee_name?.toLowerCase().trim() ||
    ""

  // 🔥 HIDE BY RANK
  if (
    HIDDEN_RANKS.some(hidden =>
      rank.includes(hidden)
    )
  ) {
    return false
  }

  // 🔥 HIDE SPECIAL EMPLOYEE NAMES
  if (
    HIDDEN_RANKS.some(hidden =>
      name.includes(hidden)
    )
  ) {
    return false
  }

  return true
}

const topWeekly =
  weekly.filter(isVisibleEmployee)[0]

const topMonthly =
  monthly.filter(isVisibleEmployee)[0]

const topYearly =
  yearly.filter(isVisibleEmployee)[0]

  const leaderboard = [

  ...topEmployees.filter(
    isVisibleEmployee
  ),

  ...[topWeekly, topMonthly, topYearly]
    .filter(Boolean)
    .map(extra => ({
      ...extra,
      name:
        extra.employee_name ||
        extra.name,
      calculated_lifetime_hours: 0,
    })),

];

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading analytics...
      </div>
    )
  }

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

<div className="flex justify-between items-center mb-8">

  <h1 className="text-4xl font-bold text-emerald-700">
    Employee Analytics
  </h1>

  <button
    onClick={() => window.location.href = "/manager-analytics"}
    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
  >
    Manager Analytics →
  </button>

</div>

      {/* 🔥 TOP PERFORMERS (NEW) */}
      <div className="bg-white rounded-xl shadow mb-10 p-6">

        <div className="text-emerald-700 font-semibold mb-4">
          Top Performers
        </div>

<div className="grid grid-cols-3 gap-4 text-sm">

  <div>
    <div className="text-emerald-700 font-semibold">Weekly</div>

    <div className="text-emerald-600 mt-1 font-medium">
      {
        weekly.filter(isVisibleEmployee)[0]?.employee_name ||
        weekly.filter(isVisibleEmployee)[0]?.name ||
        "-"
      }
    </div>
  </div>

  <div>
  <div className="text-emerald-700 font-semibold">
  Monthly
</div>

    <div className="text-emerald-600 mt-1 font-medium">
      {
        monthly.filter(isVisibleEmployee)[0]?.employee_name ||
        monthly.filter(isVisibleEmployee)[0]?.name ||
        "-"
      }
    </div>
  </div>

  <div>
    <div className="text-emerald-700 font-semibold">Yearly</div>

    <div className="text-emerald-600 mt-1 font-medium">
      {
        yearly.filter(isVisibleEmployee)[0]?.employee_name ||
        yearly.filter(isVisibleEmployee)[0]?.name ||
        "-"
      }
    </div>
  </div>

</div>

      </div>

      {/* 🔥 PROMOTIONS */}
      <div className="mb-10">

<div className="flex justify-between items-center px-2 mb-5">

  <div className="text-emerald-700 font-semibold">
    Promotion Recommendations
  </div>

</div>

        {promotions.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No promotions needed
          </div>
        ) : (
          promotions
  .filter(isVisibleEmployee)
  .map(emp => (
<div
  key={emp.name}
  className="
    flex justify-between items-center
    bg-white shadow rounded-xl
    px-6 py-4 mb-3
    border border-emerald-100
    hover:border-emerald-300
    transition
  "
>

  <div>

    <div className="text-emerald-700 font-semibold">
      {emp.name}
    </div>

    <div
      className="
        mt-1 inline-flex items-center gap-1
        px-2 py-[2px]
        rounded-full
        text-[10px] font-medium
        bg-emerald-50
        text-emerald-700
        border border-emerald-200
      "
    >
      Promotion Eligible
    </div>

  </div>

  <button
    className="
      text-xs bg-emerald-600 text-white
      px-4 py-2 rounded-lg
      hover:bg-emerald-700
      transition
    "
  >
    Promote
  </button>

</div>
          ))
        )}

      </div>

      {/* 🔥 SNAPSHOT CAROUSEL */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">

        <div className="flex justify-between mb-4">

          <div className="text-emerald-700 font-semibold">
            Weekly Snapshots
          </div>

          <div className="space-x-2">
            <button onClick={()=>setSnapIndex(i=>Math.max(i-1,0))}>←</button>
            <button onClick={()=>setSnapIndex(i=>Math.min(i+1,snapshots.length-1))}>→</button>
          </div>

        </div>

        {snapshots.length === 0 ? (
          <div className="text-gray-500 text-sm">No snapshots</div>
        ) : (
          snapshots[snapIndex]?.map((s:any)=>(
            <div key={s.id} className="text-sm py-1">
              {s.employee_id} - {formatHours(s.total_minutes)}
            </div>
          ))
        )}

      </div>

      {/* 🔥 ORIGINAL TOP EMPLOYEES */}
      <div className="mb-10">

<div className="flex justify-between items-center px-2 mb-5">

  <div className="flex justify-between items-center">

    <div className="text-emerald-700 font-semibold">
      Top Employees
    </div>

  </div>

</div>

        {topEmployees.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No data available
          </div>
) : (

leaderboard.map((emp:any, index:number) => (

 <div
 key={`${emp.name}-${index}`}
  className="
    flex justify-between items-center
    bg-white shadow rounded-xl
    px-6 py-4 mb-3
    border border-emerald-100
    hover:border-emerald-300
    transition
  "
>
<div>

  <div className="text-emerald-700 font-semibold">
    {emp.name}
  </div>

<div className="grid grid-cols-2 gap-2 mt-3 max-w-[420px]">

  {/* 🔥 LIFETIME */}
  <div
    className={`
      px-2.5 py-[5px] rounded-full text-[10px]
      font-semibold inline-flex items-center gap-1
      backdrop-blur-sm
      ${performerBadges.lifetime.className}
    `}
  >
    ✨ {performerBadges.lifetime.label}
  </div>

  {/* 🔥 WEEKLY */}
  {(emp.name === topWeekly?.employee_name ||
    emp.name === topWeekly?.name) && (

    <div
      className={`
        px-2.5 py-[5px] rounded-full text-[10px]
        font-semibold inline-flex items-center gap-1
        backdrop-blur-sm
        ${performerBadges.weekly.className}
      `}
    >
      ⚡ {performerBadges.weekly.label}
    </div>

  )}

  {/* 🔥 MONTHLY */}
  {(emp.name === topMonthly?.employee_name ||
    emp.name === topMonthly?.name) && (

    <div
      className={`
        px-2.5 py-[5px] rounded-full text-[10px]
        font-semibold inline-flex items-center gap-1
        backdrop-blur-sm
        ${performerBadges.monthly.className}
      `}
    >
      🌊 {performerBadges.monthly.label}
    </div>

  )}

  {/* 🔥 YEARLY */}
  {(emp.name === topYearly?.employee_name ||
    emp.name === topYearly?.name) && (

    <div
      className={`
        px-2.5 py-[5px] rounded-full text-[10px]
        font-medium inline-flex items-center gap-1 whitespace-nowrap
        backdrop-blur-sm
        ${performerBadges.yearly.className}
      `}
    >
      👑 {performerBadges.yearly.label}
    </div>

  )}

</div>

</div>

<div className="text-right">

  <div className="text-emerald-700 font-semibold text-xl leading-none">
    {emp.calculated_lifetime_hours || 0}h
  </div>

<div className="text-xs text-emerald-400 uppercase tracking-wide mt-1">
  Lifetime Hours
</div>

</div>
            </div>
          ))
        )}

      </div>

      {/* 🔥 FULL TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-5 px-6 py-4 text-sm font-semibold text-emerald-700 border-b">
          <div>Employee</div>
          <div>Total Hours</div>
          <div>Weekly Hours</div>
          <div>Wage</div>
          <div>Earnings</div>
        </div>

        {employees.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No employee data found
          </div>
        ) : (
          employees.map(emp => (

<div
  key={emp.name}
              className="grid grid-cols-5 px-6 py-3 text-sm border-b items-center"
            >

              <div className="text-emerald-700 font-medium">
                {emp.name}
              </div>

              <div>
                {formatHours(emp.total_minutes)}
              </div>

              <div>
                {formatHours(emp.weekly_minutes)}
              </div>

              <div>
                ${emp.wage}
              </div>

              <div className="text-emerald-700 font-semibold">
                ${earnings(emp.total_minutes, emp.wage)}
              </div>

            </div>

          ))
        )}

      </div>

    </div>

  )

}