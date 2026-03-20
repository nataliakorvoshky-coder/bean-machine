"use client"

import { useState, useEffect } from "react"

export default function SettingsPage(){

  const [username,setUsername] = useState("")
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState("")

  useEffect(()=>{
    loadProfile()
  },[])

  async function loadProfile(){
    const res = await fetch("/api/profile/me")
    const data = await res.json()

    if(data?.username){
      setUsername(data.username)
    }
  }

  async function saveUsername(){

    setLoading(true)
    setMessage("")

    const res = await fetch("/api/user/update-username",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ username })
    })

    const data = await res.json()

    if(data.error){
      setMessage(data.error)
    } else {
      setMessage("Username updated successfully")
    }

    setLoading(false)
  }

  return(

    <div className="w-[600px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Settings
      </h1>

      <div className="bg-white p-8 rounded-xl shadow">

        <h2 className="text-lg font-semibold text-emerald-700 mb-6">
          Profile Settings
        </h2>

        <div className="flex flex-col gap-4">

          <div className="flex flex-col">
            <label className="text-sm text-emerald-700 font-semibold mb-1">
              Username
            </label>

            <input
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              className="border border-emerald-300 rounded px-3 py-2"
              placeholder="Enter username"
            />
          </div>

          <button
            onClick={saveUsername}
            disabled={loading}
            className="bg-emerald-600 text-white px-5 py-2 rounded w-fit"
          >
            {loading ? "Saving..." : "Save"}
          </button>

          {message && (
            <p className="text-sm text-gray-600">
              {message}
            </p>
          )}

        </div>

      </div>

    </div>
  )
}