"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import StyledDropdown from "@/components/StyledDropdown"
import StyledDatePicker from "@/components/StyledDatePicker"

const API = "/api/employees"

export default function EmployeeProfilePage(){

  const params = useParams()
  const id = params.id as string

  const [employee,setEmployee] = useState<any>(null)
  const [status,setStatus] = useState("")
  const [strikeReason,setStrikeReason] = useState("")
  const [strikeHistory,setStrikeHistory] = useState<any[]>([])

  useEffect(()=>{
    if(id){
      loadEmployee()
    }
  },[id])


  async function loadEmployee(){

    const res = await fetch(`${API}/${id}`)
    const data = await res.json()

    setEmployee(data)
    setStatus(data.status)
    setStrikeHistory(data.strike_history ?? [])

  }



  async function updateStatus(newStatus:string){

    const res = await fetch(`${API}/${id}`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ status:newStatus })
    })

    const data = await res.json()

    if(data.success){

      setStatus(newStatus)

      setEmployee((prev:any)=>({
        ...prev,
        status:newStatus
      }))

    }

  }



  async function promoteEmployee(){

    const res = await fetch(`${API}/${id}/promote`,{
      method:"POST"
    })

    const data = await res.json()

    if(data.success){

      setEmployee((prev:any)=>({
        ...prev,
        rank:data.rank,
        wage:data.wage,
        rank_id:data.rank_id,
        last_promotion_date:data.last_promotion_date
      }))

    }

  }



  async function addStrike(){

    if(!strikeReason) return

    const res = await fetch(`${API}/${id}/strikes`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ reason:strikeReason })
    })

    const data = await res.json()

    if(data.success){

      setStrikeHistory(data.history ?? [])
      setStrikeReason("")

      setEmployee((prev:any)=>({
        ...prev,
        strikes:data.strikes
      }))

    }

  }



  async function deleteStrike(strikeId:string){

    const res = await fetch(`${API}/${id}/strikes`,{
      method:"DELETE",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ strike_id:strikeId })
    })

    const data = await res.json()

    if(data.success){

      setStrikeHistory(data.history ?? [])

      setEmployee((prev:any)=>({
        ...prev,
        strikes:data.strikes
      }))

    }

  }



  if(!employee){
    return <div className="p-10 text-gray-500">Loading employee...</div>
  }



  return(

    <div className="max-w-[1050px] mx-auto py-8">

      {/* HEADER */}

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Employee Profile
      </h1>


      <div className="flex justify-between items-start mb-6">

        <div>

          <div className="text-xl font-bold text-emerald-700">
            {employee.name}
          </div>

          <div className="flex items-center gap-3 mt-1">

            <span className="px-3 py-[2px] rounded-full bg-blue-100 text-blue-600 text-xs">
              {employee.rank}
            </span>

            {employee.strikes > 0 && (
              <span className="px-2 py-[2px] rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                ⚠ {employee.strikes} Strike
              </span>
            )}

          </div>

        </div>


        <div className="w-[160px]">

          <StyledDropdown
            value={status}
            onChange={updateStatus}
            placeholder="Status"
            options={[
              { id:"Active", name:"Active" },
              { id:"ROA", name:"ROA" },
              { id:"LOA", name:"LOA" }
            ]}
          />

        </div>

      </div>



      {/* PANELS */}

      <div className="grid grid-cols-2 gap-6">

        {/* EMPLOYMENT */}

        <div className="bg-white rounded-xl shadow p-5">

          <h2 className="text-lg font-bold text-emerald-700 mb-4">
            Employment
          </h2>

          <div className="space-y-4 text-sm">

            <div className="flex justify-between">
              <div className="text-emerald-700">Hire Date</div>
              <div className="text-emerald-500">{employee.hire_date}</div>
            </div>

            <div className="flex justify-between items-center">

              <div className="text-emerald-700">Last Promotion</div>

              <div className="ml-6 w-[160px]">
                <StyledDatePicker
                  value={employee.last_promotion_date}
                  onChange={()=>{}}
                />
              </div>

            </div>

          </div>

        </div>



        {/* CONTACT */}

        <div className="bg-white rounded-xl shadow p-5">

          <h2 className="text-lg font-bold text-emerald-700 mb-4">
            Contact
          </h2>

          <div className="space-y-4 text-sm">

            <div className="flex justify-between">
              <div className="text-emerald-700">Phone</div>
              <div className="text-emerald-500">{employee.phone}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-emerald-700">CID</div>
              <div className="text-emerald-500">{employee.cid}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-emerald-700">IBAN</div>
              <div className="text-emerald-500">{employee.iban}</div>
            </div>

          </div>

        </div>

      </div>



      {/* HOURS PANEL */}

      <div className="bg-white rounded-xl shadow p-5 mt-6">

        <h2 className="text-lg font-bold text-emerald-700 mb-4">
          Hours & Earnings
        </h2>

        <div className="grid grid-cols-4 gap-8 text-sm">

          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">
              {employee.current_hours ?? 0}
            </div>
          </div>

          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">
              {employee.lifetime_hours ?? 0}
            </div>
          </div>

          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">
              ${employee.earnings ?? 0}
            </div>
          </div>

          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">
              ${employee.lifetime_earnings ?? 0}
            </div>
          </div>

        </div>

      </div>



      {/* STRIKE HISTORY */}

      <div className="bg-white rounded-xl shadow p-5 mt-6">

        <h2 className="text-lg font-bold text-emerald-700 mb-4">
          Strike History
        </h2>


        <div className="flex gap-4 items-center mb-4">

          <div className="w-[70px] border border-emerald-300 rounded px-3 py-2 text-center text-emerald-600">
            {employee.strikes + 1}
          </div>

          <input
            value={strikeReason}
            onChange={(e)=>setStrikeReason(e.target.value)}
            placeholder="Add strike reason"
            className="
              flex-1
              border border-emerald-300
              rounded
              px-3 py-2
              text-sm
              text-emerald-600
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:border-emerald-500
              transition
            "
          />

          <button
            onClick={addStrike}
            className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700"
          >
            Update
          </button>

        </div>



        <div className="space-y-2">

          {strikeHistory.map((strike:any,index)=>(

            <div
              key={strike.id}
              className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm"
            >

              <div className="flex gap-4 items-center">

                <div className="text-red-500 font-semibold">
                  #{strike.number ?? index+1}
                </div>

                <div className="text-emerald-700">
                  {strike.reason}
                </div>

                <div className="text-xs text-emerald-500">
                  {new Date(strike.created_at).toLocaleDateString()}
                </div>

              </div>

              <button
                onClick={()=>deleteStrike(strike.id)}
                className="text-red-500 text-xs hover:text-red-700"
              >
                Delete
              </button>

            </div>

          ))}

        </div>

      </div>



      {/* ACTION BUTTONS */}

      <div className="flex gap-4 mt-6">

        <button
          onClick={promoteEmployee}
          className="bg-green-600 text-white px-5 py-2 rounded text-sm hover:bg-green-700"
        >
          Promote
        </button>

        <button className="bg-yellow-500 text-white px-5 py-2 rounded text-sm hover:bg-yellow-600">
          Demote
        </button>

        <button className="bg-red-600 text-white px-5 py-2 rounded text-sm hover:bg-red-700">
          Terminate
        </button>

      </div>

    </div>

  )

}