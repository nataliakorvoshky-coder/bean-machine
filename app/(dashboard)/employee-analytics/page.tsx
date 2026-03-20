"use client"

import { useEffect, useState } from "react"

const API = "/api/hours"

type EmployeeStats = {
  id: string
  name: string
  total_minutes: number
  weekly_minutes: number
  wage: number
}

export default function EmployeeAnalytics(){

  const [employees,setEmployees] = useState<EmployeeStats[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    try{

      const res = await fetch(API,{
        method:"GET"
      })

      const data = await res.json()

      setEmployees(Array.isArray(data) ? data : [])

    }catch(err){
      console.error(err)
      setEmployees([])
    }

    setLoading(false)
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

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Employee Analytics
      </h1>

      {/* TOP PERFORMERS */}
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

      {/* FULL TABLE */}
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