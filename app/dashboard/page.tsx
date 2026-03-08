"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import OnlineUsers from "@/components/OnlineUsers"
import ActivityFeed from "@/components/ActivityFeed"

export default function Dashboard() {

  const [user,setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(()=>{

    const getUser = async ()=>{

      const { data } = await supabase.auth.getUser()

      if(!data.user){
        router.push("/")
      }else{
        setUser(data.user)
      }

    }

    getUser()

  },[])



  return(

  <main className="flex-1 flex justify-center items-center">

  {/* DASHBOARD CARD */}

  <div className="bg-white p-10 rounded-xl shadow w-[900px]">

  {/* HEADER */}

  <h1 className="text-xl font-bold mb-6 text-emerald-700">
  Dashboard
  </h1>

  {user && (
  <p className="text-gray-600 mb-8">
  Logged in as: {user.email}
  </p>
  )}



  {/* PANELS */}

  <div className="grid grid-cols-2 gap-8">

  <OnlineUsers />

  <ActivityFeed />

  </div>

  </div>

  </main>

  )

}