"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ApplicationsPage(){

  const [apps,setApps] = useState<any[]>([])

  useEffect(()=>{

    load()

    const channel = supabase
      .channel("applications-live")
      .on(
        "postgres_changes",
        {
          event:"INSERT",
          schema:"public",
          table:"applications"
        },
        (payload)=>{
          setApps(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return ()=>{
      supabase.removeChannel(channel)
    }

  },[])

  async function load(){
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at",{ ascending:false })

    setApps(data || [])
  }

  return(

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Applications
      </h1>

      {apps.map(app=>(
        <div
          key={app.id}
          className="bg-white border border-emerald-300 rounded-xl p-6 mb-4 shadow"
        >

          <div className="text-xl font-semibold text-emerald-700">
            {app.name} ({app.cid})
          </div>

          <div className="text-sm text-gray-500">
            Discord: {app.discord}
          </div>

          <div className="mt-2">
            Timezone: {app.timezone}
          </div>

          <div>
            Restaurant Experience: {app.restaurant_exp}
          </div>

          <div>
            Activity: {app.activity_level}/10
          </div>

          <div className="mt-3">
            <strong>Why Join:</strong>
            <p>{app.why_join}</p>
          </div>

        </div>
      ))}

    </div>
  )
}