"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [message,setMessage] = useState("")



  useEffect(()=>{

    async function loadProfile(){

      const { data } = await supabase.auth.getUser()

      const user = data.user

      if(!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single()

      if(profile?.username){
        setUsername(profile.username)
      }

    }

    loadProfile()

  },[])



  async function updateUsername(){

    const { data } = await supabase.auth.getUser()

    const user = data.user

    if(!user) return

    await supabase
      .from("profiles")
      .upsert({
        user_id:user.id,
        username
      })

    setMessage("Username updated successfully")

  }



  async function updatePassword(){

    await supabase.auth.updateUser({
      password
    })

    setPassword("")
    setMessage("Password updated successfully")

  }



  return(

  <div className="bg-white p-10 rounded-xl shadow w-[420px]">

  <h1 className="text-xl font-bold mb-6 text-emerald-700">
  Account Settings
  </h1>



  {/* USERNAME */}

  <label className="block mb-2 font-semibold text-emerald-700">
  Username
  </label>

  <input
  value={username}
  onChange={(e)=>setUsername(e.target.value)}
  className="border border-emerald-400 p-3 w-full rounded mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400"
  />

  <button
  onClick={updateUsername}
  className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
  >
  Update Username
  </button>



  <div className="mt-10 border-t pt-8">

  <h2 className="text-lg font-semibold text-emerald-700 mb-4">
  Create New Password
  </h2>

  <input
  type="password"
  placeholder="New Password"
  value={password}
  onChange={(e)=>setPassword(e.target.value)}
  className="border border-emerald-400 p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
  />

  <button
  onClick={updatePassword}
  className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
  >
  Update Password
  </button>

  </div>



  {message && (
  <p className="text-sm text-gray-600 mt-4">
  {message}
  </p>
  )}

  </div>

  )

}