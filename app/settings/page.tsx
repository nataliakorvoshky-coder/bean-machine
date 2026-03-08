"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

  const [username,setUsername] = useState("")
  const [message,setMessage] = useState("")



  async function updateUsername(){

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if(!user) return

    const res = await fetch("/api/user/update-username",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        userId:user.id,
        username
      })
    })

    const result = await res.json()

    if(result.success){
      setMessage("Username updated")
    }

  }



  function logout(){
    supabase.auth.signOut()
    window.location.href="/"
  }



  return(

  <main className="min-h-screen bg-gray-100 flex">

  {/* SIDEBAR */}

  <div className="w-64 bg-emerald-700 text-white flex flex-col p-6">

  <h2 className="text-xl font-bold mb-10">
  Bean Machine
  </h2>

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



  {/* SETTINGS CONTENT */}

  <div className="flex-1 flex justify-center items-center">

  <div className="bg-white p-10 rounded-xl shadow w-[420px]">

  <h1 className="text-xl font-bold mb-6 text-emerald-700">
  Account Settings
  </h1>

  <label className="block mb-2 font-semibold">
  Username
  </label>

  <input
  value={username}
  onChange={(e)=>setUsername(e.target.value)}
  className="border border-emerald-400 p-3 w-full rounded mb-6"
  />

  <button
  onClick={updateUsername}
  className="bg-emerald-500 text-white p-3 rounded w-full"
  >
  Update Username
  </button>

  {message && (
  <p className="text-sm text-gray-600 mt-4">
  {message}
  </p>
  )}

  </div>

  </div>

  </main>

  )

}