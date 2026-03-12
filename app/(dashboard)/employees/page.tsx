"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const API = "/api/employees"

export default function EmployeesPage(){

  const [employees,setEmployees] = useState<any[]>([])
  const [search,setSearch] = useState("")

  useEffect(()=>{
    loadEmployees()
  },[])

  async function loadEmployees(){

    const res = await fetch(API)
    const data = await res.json()

    setEmployees(Array.isArray(data) ? data : [])

  }

  /* STATUS COLORS */

  function statusBadge(status:string){

    if(status === "Active"){
      return "bg-emerald-100 text-emerald-700"
    }

    if(status === "ROA" || status === "LOA"){
      return "bg-yellow-100 text-yellow-700"
    }

    return "bg-gray-100 text-gray-600"

  }

  function rowBorder(status:string){

    if(status === "Active"){
      return "border border-emerald-400"
    }

    if(status === "ROA" || status === "LOA"){
      return "border border-yellow-400"
    }

    return "border border-gray-200"

  }

  /* SEARCH FILTER */

  const filteredEmployees = employees.filter(emp => {

    if(!search) return true

    const name = emp.name.toLowerCase()
    const query = search.toLowerCase()

    return name.startsWith(query) || name.includes(query)

  })

  /* TOTAL HOURS CALCULATION */

  const totalMinutes = employees.reduce((acc,e)=>{

    const hours = e.hours ?? 0
    const minutes = e.minutes ?? 0

    return acc + (hours * 60) + minutes

  },0)

  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return(

    <div className="w-full px-10 py-8">


      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-emerald-700">
          Employees
        </h1>


        {/* TOTAL HOURS PANEL */}

        <div className="
          bg-white
          shadow
          rounded-xl
          px-5 py-3
          w-[200px]
          text-right
        ">

          <div className="text-xs text-gray-500">
            Total Employee Hours
          </div>

          <div className="text-lg font-semibold text-emerald-700">
            {totalHours}h {remainingMinutes}m
          </div>

        </div>

      </div>


      {/* SEARCH */}

      <div className="mb-8">

        <div className="bg-white shadow rounded-xl px-4 py-2 w-[420px]">

          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="w-full text-sm outline-none text-gray-700"
          />

        </div>

      </div>


      {/* TABLE HEADER */}

      <div className="
        grid
        grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr]
        text-sm
        font-semibold
        text-emerald-700
        px-6
        mb-3
      ">

        <div>Name</div>
        <div>Status</div>
        <div>Rank</div>
        <div>Wage</div>
        <div>Hours</div>
        <div>Earnings</div>
        <div>Goal</div>

      </div>


      {/* EMPLOYEE ROWS */}

      {filteredEmployees.map(emp=>(

        <div
          key={emp.id}
          className={`
            grid
            grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr]
            items-center
            bg-white
            shadow
            rounded-xl
            px-6 py-2
            mb-3
            ${rowBorder(emp.status)}
          `}
        >

          {/* NAME */}

          <Link
            href={`/employees/${emp.id}`}
            className="
              text-emerald-700
              font-medium
              hover:bg-emerald-50
              px-2 py-[2px]
              rounded
              w-fit
            "
          >
            {emp.name}
          </Link>


          {/* STATUS */}

          <div>
            <span className={`px-2 py-[2px] rounded-full text-xs ${statusBadge(emp.status)}`}>
              {emp.status}
            </span>
          </div>


          {/* RANK */}

          <div>
            <span className="px-2 py-[2px] rounded-full bg-blue-100 text-blue-600 text-xs">
              {emp.rank}
            </span>
          </div>


          {/* WAGE */}

          <div className="text-emerald-700 font-medium text-sm">
            ${emp.wage}/hr
          </div>


          {/* HOURS */}

          <div className="text-emerald-700 font-medium text-sm">
            {emp.hours ?? 0}
          </div>


          {/* EARNINGS */}

          <div className="text-emerald-700 font-semibold text-sm">
            ${emp.earnings ?? 0}
          </div>


          {/* GOAL */}

          <div className={emp.goal_met ? "text-emerald-600 text-sm" : "text-red-500 text-sm"}>
            {emp.goal_met ? "Met" : "Not Met"}
          </div>

        </div>

      ))}

    </div>

  )

}