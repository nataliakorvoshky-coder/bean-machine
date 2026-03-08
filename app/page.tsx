"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function HomePage() {

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

    document.cookie=`user_id=${data.user.id}; path=/`

    router.push("/admin")
  }

  return (

    <main className="relative min-h-screen flex items-center justify-center bg-emerald-100">

      {/* Coffee Image */}

      <img
        src="/coffee.png"
        className="absolute right-0 top-0 h-full w-auto object-contain"
      />

      {/* Mint Overlay */}

      <div className="absolute inset-0 bg-emerald-100/70"></div>


      {/* Login Card */}

      <div className="relative bg-white p-10 rounded-2xl shadow-2xl w-[360px]">

        <div className="text-center mb-8">

          <img src="/logo.png" className="w-16 mx-auto mb-4"/>

          <h1 className="text-2xl font-bold text-emerald-700">
            Login
          </h1>

        </div>

        <form onSubmit={login} className="space-y-5">

         <input
  type="email"
  placeholder="email"
  value={email}
  onChange={(e)=>setEmail(e.target.value)}
  className="border border-emerald-300 p-3 w-full rounded bg-white text-black
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
/>

          <input
  type="password"
  placeholder="password"
  value={password}
  onChange={(e)=>setPassword(e.target.value)}
  className="border border-emerald-300 p-3 w-full rounded bg-white text-black
  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
/>

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