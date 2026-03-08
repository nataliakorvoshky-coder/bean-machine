"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function DashboardLayout({
  children
}:{
  children: React.ReactNode
}){

  const [username,setUsername] = useState("")
  const [status,setStatus] = useState("online")


  async function logout(){

    await supabase.auth.signOut()
    window.location.href="/"

  }



  useEffect(()=>{

    async function loadUser(){

      const { data } = await supabase.auth.getUser()

      const user = data.user

      if(!user){
        window.location.href="/"
        return
      }

      const res = await fetch("/api/user/profile",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          userId:user.id
        })
      })

      const profile = await res.json()

      if(profile.username){
        setUsername(profile.username)
      }

    }

    loadUser()

  },[])



  function getStatusColor(){

    if(status==="online") return "bg-green-400"
    if(status==="idle") return "bg-yellow-400"
    return "bg-gray-400"

  }



  return(

  <main className="min-h-screen flex">




  {/* SIDEBAR */}

  <div className="w-[240px] bg-emerald-800 text-white flex flex-col p-6">

  <h1 className="text-xl font-bold mb-8">
  Bean Machine
  </h1>



  {/* USER NAME PLATE */}

  <div className="bg-emerald-700 p-3 rounded mb-8 flex items-center gap-3 shadow">

  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />

  <span className="font-semibold">
  {username || "Loading..."}
  </span>

  </div>



  {/* NAV */}

  <nav className="flex flex-col gap-4 text-sm">

  <Link href="/dashboard" className="hover:text-emerald-200">
  Dashboard
  </Link>

  <Link href="/activity" className="hover:text-emerald-200">
  Activity
  </Link>

  <Link href="/settings" className="hover:text-emerald-200">
  Settings
  </Link>

  </nav>



  <div className="mt-auto">

  <button
  onClick={logout}
  className="text-sm hover:text-emerald-200"
  >
  Logout
  </button>

  </div>

  </div>




  {/* PAGE CONTENT */}

  <div className="flex-1 bg-gradient-to-br from-emerald-100 to-emerald-200 p-10">

  {children}

  </div>



  </main>

  )

}