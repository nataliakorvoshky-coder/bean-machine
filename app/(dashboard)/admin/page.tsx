"use client"

import { useState } from "react"
import { useUserData } from "@/lib/UserDataContext"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

type User = {
  id: string
  email?: string
  username?: string
  disabled?: boolean
}

export default function AdminPage(){

  usePermission("admin")

  const { users, refreshUsers } = useUserData()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  async function createUser(){

    const res = await fetch("/api/admin/create-user",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        email,
        password
      })
    })

    if(res.ok){

      setEmail("")
      setPassword("")

      await refreshUsers()

      alert("User created")

    }else{

      alert("Failed to create user")

    }

  }

  async function toggleUser(id:string,disabled:boolean){

    await supabase
      .from("profiles")
      .update({ disabled:!disabled })
      .eq("id",id)

    await refreshUsers()

  }

  return(

    <div className="w-[1000px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Admin Dashboard
      </h1>

      <div className="flex gap-12">

        {/* CREATE USER */}

        <div className="w-[420px] bg-white p-8 rounded-xl shadow">

          <h2 className="font-semibold mb-6 text-emerald-700">
            Create User
          </h2>

          <div className="space-y-4">

            <input
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              type="password"
              placeholder="Temporary Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={createUser}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Create User
            </button>

          </div>

        </div>

        {/* CURRENT USERS */}

        <div className="w-[420px] bg-white p-8 rounded-xl shadow">

          <h2 className="font-semibold mb-6 text-emerald-700">
            Current Users
          </h2>

          <div className="space-y-3">

            {(users as User[]).map((u)=>{

              return(

                <div
                  key={u.id}
                  className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
                >

                  <span className="font-medium">
                    {u.username || u.email || "User"}
                  </span>

                  <button
                    onClick={()=>toggleUser(u.id,!!u.disabled)}
                    className={`px-3 py-1 rounded text-white text-sm ${
                      u.disabled
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >

                    {u.disabled ? "Enable" : "Disable"}

                  </button>

                </div>

              )

            })}

          </div>

        </div>

      </div>

    </div>

  )

}