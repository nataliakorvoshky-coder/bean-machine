"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [usernameMessage,setUsernameMessage] = useState("")
  const [passwordMessage,setPasswordMessage] = useState("")



  // LOAD CURRENT USER PROFILE

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

      if(profile.username){
        setUsername(profile.username)
      }

    }

    loadProfile()

  },[])



  // UPDATE USERNAME

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
      setUsernameMessage("Username updated successfully")
    }

  }



  // UPDATE PASSWORD

  async function updatePassword(){

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if(!error){
      setPasswordMessage("Password updated successfully")
      setPassword("")
    }

  }



  return(

  <div className="flex justify-center items-start pt-20">

    <div className="bg-white p-10 rounded-xl shadow w-[420px]">

      {/* USERNAME SECTION */}

      <h1 className="text-xl font-bold mb-6 text-emerald-700">
        Account Settings
      </h1>

      <label className="block mb-2 font-semibold">
        Username
      </label>

      <input
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
        className="border border-emerald-400 p-3 w-full rounded mb-6 focus:ring-2 focus:ring-emerald-300"
      />

      <button
        onClick={updateUsername}
        className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
      >
        Update Username
      </button>

      {usernameMessage && (
        <p className="text-sm text-gray-600 mt-4">
          {usernameMessage}
        </p>
      )}



      {/* PASSWORD SECTION */}

      <div className="mt-10 border-t pt-8">

        <h2 className="text-lg font-semibold text-emerald-700 mb-4">
          Create New Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border border-emerald-400 p-3 w-full rounded mb-4 focus:ring-2 focus:ring-emerald-300"
        />

        <button
          onClick={updatePassword}
          className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
        >
          Update Password
        </button>

        {passwordMessage && (
          <p className="text-sm text-gray-600 mt-4">
            {passwordMessage}
          </p>
        )}

      </div>

    </div>

  </div>

  )

}