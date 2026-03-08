"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardLayout({
  children
}:{
  children: React.ReactNode
}){

  const [username,setUsername] = useState("")
  const [status,setStatus] = useState("active")



  async function logout(){

    await supabase.auth.signOut()
    window.location.href="/"

  }



  // LOAD USER PROFILE

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
        body: JSON.stringify({ userId:user.id })
      })

      const profile = await res.json()

      setUsername(profile.username || "User")

      // FIRST LOGIN → FORCE SETTINGS

      if(!profile.username){
        window.location.href="/settings"
      }

    }

    loadUser()

  },[])



  // USER ACTIVITY DETECTOR

  useEffect(()=>{

    let idleTimer:any

    function setActive(){

      setStatus("active")

      clearTimeout(idleTimer)

      idleTimer = setTimeout(()=>{
        setStatus("idle")
      },60000)

    }

    window.addEventListener("mousemove",setActive)
    window.addEventListener("keydown",setActive)

    setActive()

    return ()=>{
      window.removeEventListener("mousemove",setActive)
      window.removeEventListener("keydown",setActive)
    }

  },[])



  // STATUS COLOR

  const statusColor =
    status === "active"
      ? "bg-green-400"
      : status === "idle"
      ? "bg-yellow-400"
      : "bg-gray-400"



  return(

    <main className="min-h-screen bg-emerald-100 flex">



      {/* SIDEBAR */}

      <div className="w-64 bg-emerald-700 text-white flex flex-col p-6">

        <h2 className="text-xl font-bold mb-10">
          Bean Machine
        </h2>



        {/* USERNAME PLATE */}

        <div className="bg-emerald-600 p-3 rounded mb-8 flex items-center justify-center gap-2 font-semibold shadow-md">

          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>

          {username}

        </div>



        {/* NAVIGATION */}

        <nav className="flex flex-col gap-4">

          <button
            onClick={()=>window.location.href="/admin"}
            className="text-left hover:opacity-80"
          >
            Dashboard
          </button>

          <button
            onClick={()=>window.location.href="/activity"}
            className="text-left hover:opacity-80"
          >
            Activity
          </button>

          <button
            onClick={()=>window.location.href="/settings"}
            className="text-left hover:opacity-80"
          >
            Settings
          </button>

          <button
            onClick={logout}
            className="text-left hover:opacity-80 mt-10"
          >
            Logout
          </button>

        </nav>

      </div>



      {/* PAGE CONTENT */}

      <div className="flex-1 p-10">

        {children}

      </div>



    </main>

  )

}