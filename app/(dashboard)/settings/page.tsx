"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/UserContext"

export default function SettingsPage(){

  const { username,setUsername } = useUser()

  const [localUsername,setLocalUsername] = useState("")
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
        .eq("id", user.id)   // FIXED
        .single()

      if(profile?.username){
        setLocalUsername(profile.username)
      }

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
        username:localUsername   // FIXED
      })
    })

    const result = await res.json()

    if(result.success){

      setUsername(localUsername)  // update sidebar immediately
      setMessage("Username updated successfully")

    }

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



  <label className="block mb-2 font-semibold text-emerald-700">
  Username
  </label>

  <input
  value={localUsername}
  onChange={(e)=>setLocalUsername(e.target.value)}
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