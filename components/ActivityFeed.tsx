"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

export default function ActivityFeed(){

  const { users } = useUserData()

  const [logs,setLogs] = useState<any[]>([])
  const [userFilter,setUserFilter] = useState("")
  const [typeFilter,setTypeFilter] = useState("")

  async function loadLogs(){

    const res = await fetch("/api/activity")
    const data = await res.json()

    setLogs(data.logs || [])

  }

  useEffect(()=>{

    loadLogs()

    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event:"INSERT",
          schema:"public",
          table:"activity_logs"
        },
        payload=>{
          setLogs(prev=>[payload.new,...prev])
        }
      )
      .subscribe()

    return ()=>{
      supabase.removeChannel(channel)
    }

  },[])

  const filtered = logs.filter(log=>{

    if(userFilter && log.username!==userFilter) return false
    if(typeFilter && log.type!==typeFilter) return false

    return true

  })

  return(

    <div className="w-[420px] bg-white p-8 rounded-xl shadow">

      <h2 className="font-semibold mb-6 text-emerald-700">
        Activity Feed
      </h2>

      <div className="flex gap-3 mb-6">

        <select
          value={userFilter}
          onChange={e=>setUserFilter(e.target.value)}
          className="border border-emerald-400 p-2 rounded text-sm"
        >

          <option value="">All Users</option>

          {users.map((u:any)=>(
            <option key={u.id} value={u.username}>
              {u.username}
            </option>
          ))}

        </select>

        <select
          value={typeFilter}
          onChange={e=>setTypeFilter(e.target.value)}
          className="border border-emerald-400 p-2 rounded text-sm"
        >

          <option value="">All Types</option>
          <option value="admin">Admin</option>
          <option value="stock">Stock</option>
          <option value="employee">Employee</option>

        </select>

      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto">

        {filtered.map(log=>(

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

        {filtered.length===0 &&(

          <div className="text-gray-400 text-sm">
            No activity yet
          </div>

        )}

      </div>

    </div>

  )

}