"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ActivityFeed(){

 const [logs,setLogs] = useState<any[]>([])

 async function loadLogs(){

  const { data } = await supabase
   .from("activity_log")
   .select("*")
   .order("created_at",{ ascending:false })
   .limit(20)

  setLogs(data || [])

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
     table:"activity_log"
    },
    (payload)=>{
     setLogs(prev=>[payload.new,...prev])
    }
   )
   .subscribe()

  return ()=>{
   supabase.removeChannel(channel)
  }

 },[])



 return(

 <div className="bg-white rounded-xl shadow p-6">

 <h2 className="text-lg font-bold text-emerald-700 mb-4">
 Activity Feed
 </h2>

 <div className="space-y-3 max-h-[400px] overflow-y-auto">

 {logs.map((log:any)=>(

 <div key={log.id} className="border-b pb-2">

 <div className="text-sm font-medium text-emerald-700">
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

 {logs.length===0 && (
 <div className="text-gray-400 text-sm">
 No activity yet
 </div>
 )}

 </div>

 </div>

 )

}