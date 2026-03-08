"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ActivityPage(){

 const [logs,setLogs] = useState<any[]>([])
 const [search,setSearch] = useState("")



 async function loadLogs(){

  let query = supabase
   .from("activity_log")
   .select("*")
   .order("created_at",{ ascending:false })

  if(search){
   query = query.ilike("username", `%${search}%`)
  }

  const { data } = await query

  setLogs(data || [])

 }



 useEffect(()=>{

  loadLogs()

  const channel = supabase
   .channel("activity-stream")
   .on(
    "postgres_changes",
    {
     event:"INSERT",
     schema:"public",
     table:"activity_log"
    },
    (payload)=>{

     setLogs((prev)=>[
      payload.new,
      ...prev
     ])

    }
   )
   .subscribe()

  return ()=>{
   supabase.removeChannel(channel)
  }

 },[])



 return(

 <main className="min-h-screen bg-gray-100 flex">

 <div className="flex-1 p-10">

 <h1 className="text-2xl font-bold text-emerald-700 mb-6">
 User Activity
 </h1>



 {/* SEARCH */}

 <div className="mb-6">

 <input
 placeholder="Search by username..."
 value={search}
 onChange={(e)=>setSearch(e.target.value)}
 className="border border-emerald-400 p-3 rounded w-[300px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
 />

 <button
 onClick={loadLogs}
 className="ml-3 bg-emerald-500 text-white px-4 py-3 rounded hover:bg-emerald-600"
 >
 Search
 </button>

 </div>



 {/* ACTIVITY LIST */}

 <div className="bg-white rounded-xl shadow p-6 space-y-4">

 {logs.map((log:any)=>(

 <div
 key={log.id}
 className="border-b pb-3"
 >

 <div className="font-medium text-emerald-700">
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

 {logs.length === 0 && (
  <div className="text-gray-500">
  No activity found
  </div>
 )}

 </div>

 </div>

 </main>

 )

}