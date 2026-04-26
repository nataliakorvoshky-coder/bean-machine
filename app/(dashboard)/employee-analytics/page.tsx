"use client"

import { useEffect, useState } from "react"

const API = "/api/employee-analytics"

type EmployeeStats = {
  id: string
  name: string
  total_minutes: number
  weekly_minutes: number
  wage: number
  hire_date?: string
  last_promotion_date?: string
}

export default function EmployeeAnalytics(){

  const [employees,setEmployees] = useState<EmployeeStats[]>([])
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

  function formatHours(min:number){
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${h}h ${m}m`
  }

  function earnings(min:number,wage:number){
    const hours = min / 60
    return (hours * wage).toFixed(2)
  }

  const topEmployees = [...employees]
    .sort((a,b)=>b.total_minutes - a.total_minutes)
    .slice(0,5)

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
            <div className="font-semibold">Weekly</div>
            <div>{weekly[0]?.name || "-"}</div>
          </div>

          <div>
            <div className="font-semibold">Monthly</div>
            <div>{monthly[0]?.name || "-"}</div>
          </div>

          <div>
            <div className="font-semibold">Yearly</div>
            <div>{yearly[0]?.name || "-"}</div>
          </div>

        </div>

      </div>

      {/* 🔥 PROMOTIONS */}
      <div className="bg-white rounded-xl shadow mb-10 p-6">

        <div className="text-emerald-700 font-semibold mb-4">
          Promotion Recommendations
        </div>

        {promotions.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No promotions needed
          </div>
        ) : (
          promotions.map(emp => (
            <div key={emp.id} className="flex justify-between py-2 border-b">

              <div>{emp.name}</div>

              <button className="text-xs bg-emerald-600 text-white px-3 py-1 rounded">
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
      <div className="bg-white rounded-xl shadow mb-10">

        <div className="px-6 py-4 border-b text-emerald-700 font-semibold">
          Top Employees
        </div>

        {topEmployees.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No data available
          </div>
        ) : (
          topEmployees.map(emp => (
            <div
              key={emp.id}
              className="flex justify-between px-6 py-3 border-b text-sm"
            >
              <div className="text-emerald-700 font-medium">
                {emp.name}
              </div>

              <div className="text-gray-600">
                {formatHours(emp.total_minutes)}
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
              key={emp.id}
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