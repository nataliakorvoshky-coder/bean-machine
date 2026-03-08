"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

  const [username,setUsername] = useState("")
  const [message,setMessage] = useState("")

  useEffect(()=>{

    async function loadProfile(){

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

      setUsername(profile.username || "")

    }

    loadProfile()

  },[])



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
      setMessage("Username updated successfully")
    }else{
      setMessage(result.error || "Error updating username")
    }

  }



  return(

    <main className="min-h-screen bg-emerald-100 flex justify-center items-center">

      <div className="bg-white p-10 rounded-xl shadow-lg w-[420px]">

        <h1 className="text-2xl font-bold mb-6 text-emerald-700">
          Account Settings
        </h1>

        <label className="block mb-2 font-semibold text-sm">
          Username
        </label>

        <input
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="border border-emerald-400 p-3 w-full rounded-lg mb-6 focus:ring-2 focus:ring-emerald-400"
        />

        <button
          onClick={updateUsername}
          className="bg-emerald-500 text-white w-full p-3 rounded-lg hover:bg-emerald-600"
        >
          Update Username
        </button>

        {message && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            {message}
          </p>
        )}

      </div>

    </main>

  )
}