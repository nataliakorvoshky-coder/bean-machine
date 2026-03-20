"use client"

import { useEffect, useState } from "react"

const API = "/api/activity"

type Activity = {
  id: string
  action: string
  description: string
  created_at: string
  user?: string
}

export default function ActivityFeedsPage(){

  const [activities,setActivities] = useState<Activity[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadActivities()
  },[])

  async function loadActivities(){

    try{

      const res = await fetch(API,{
        method:"GET"
      })

      const data = await res.json()

      setActivities(Array.isArray(data) ? data : [])

    }catch(err){
      console.error("Activity load error:", err)
      setActivities([])
    }

    setLoading(false)
  }

  function formatDate(date:string){
    return new Date(date).toLocaleString()
  }

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading activity feed...
      </div>
    )
  }

  return(

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Activity Feed
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-[2fr_4fr_2fr_2fr] px-6 py-4 text-sm font-semibold text-emerald-700 border-b">
          <div>Action</div>
          <div>Description</div>
          <div>User</div>
          <div>Date</div>
        </div>

        {activities.length === 0 && (
          <div className="p-6 text-gray-500 text-sm">
            No activity yet
          </div>
        )}

        {activities.map(item => (

          <div
            key={item.id}
            className="grid grid-cols-[2fr_4fr_2fr_2fr] px-6 py-4 text-sm border-b items-center"
          >

            <div className="text-emerald-700 font-medium">
              {item.action}
            </div>

            <div>
              {item.description}
            </div>

            <div>
              {item.user || "-"}
            </div>

            <div className="text-gray-500">
              {formatDate(item.created_at)}
            </div>

          </div>

        ))}

      </div>

    </div>

  )

}