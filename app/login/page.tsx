"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")


  async function login(e:any){

    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      alert(error.message)
      return
    }

    document.cookie = `user_id=${data.user.id}; path=/`

    router.push("/admin")

  }


  return (

    <main className="min-h-screen bg-emerald-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-xl shadow-lg w-[420px]">

        <h1 className="text-3xl font-bold text-center text-emerald-600 mb-10">
          Login
        </h1>


        <form onSubmit={login} className="space-y-6">

          <div>

            <label className="block text-emerald-700 font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="border border-emerald-400 bg-white text-black p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />

          </div>


          <div>

            <label className="block text-emerald-700 font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="border border-emerald-400 bg-white text-black p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />

          </div>


          <button
            type="submit"
            className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
          >
            Login
          </button>

        </form>

      </div>

    </main>

  )
}