"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/lib/UserDataContext"

export default function ActivityFeed(){

  const { users } = useUserData()

  const [logs,setLogs] = useState<any[]>([])
  const [userFilter,setUserFilter] = useState("")
  const [typeFilter,setTypeFilter] = useState("")

  async function loadLogs(){

    let url="/api/activity"

    const params=[]

    if(userFilter) params.push(`user=${userFilter}`)
    if(typeFilter) params.push(`type=${typeFilter}`)

    if(params.length>0){
      url+="?"+params.join("&")
    }

    const res = await fetch(url)

    const data = await res.json()

    setLogs(data.logs || [])

  }

  useEffect(()=>{
    loadLogs()
  },[])

  return(

    <div className="w-[420px] bg-white p-8 rounded-xl shadow">

      <h2 className="font-semibold mb-6 text-emerald-700">
        Activity Feed
      </h2>

      {/* FILTERS */}

      <div className="flex gap-3 mb-6">

        <select
          value={userFilter}
          onChange={(e)=>setUserFilter(e.target.value)}
          className="border border-emerald-400 p-2 rounded text-sm"
        >

          <option value="">
            All Users
          </option>

          {users.map((u:any)=>(
            <option key={u.id} value={u.username}>
              {u.username}
            </option>
          ))}

        </select>

        <select
          value={typeFilter}
          onChange={(e)=>setTypeFilter(e.target.value)}
          className="border border-emerald-400 p-2 rounded text-sm"
        >

          <option value="">All Types</option>
          <option value="admin">Admin</option>
          <option value="stock">Stock</option>
          <option value="employee">Employee</option>

        </select>

        <button
          onClick={loadLogs}
          className="bg-emerald-500 text-white px-3 py-2 rounded text-sm"
        >
          Filter
        </button>

      </div>

      {/* ACTIVITY LIST */}

      <div className="space-y-3 max-h-[350px] overflow-y-auto">

        {logs.map((log:any)=>(

          <div
            key={log.id}
            className="border border-emerald-200 p-3 rounded"
          >

            <div className="text-sm font-medium">
              {log.username}
            </div>

            <div className="text-sm text-gray-600">
              {log.action}
            </div>

            <div className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleString()}
            </div>

          </div>

        ))}

        {logs.length===0 &&(

          <div className="text-gray-400 text-sm">
            No activity yet
          </div>

        )}

      </div>

    </div>

  )

}