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

    <main className="min-h-screen bg-emerald-100 flex items-center justify-center">

      <div className="flex w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white">


        {/* LOGIN PANEL */}

        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">

          <div className="text-center mb-10">

            <img
              src="/logo.png"
              className="w-16 mx-auto mb-4"
            />

            <h1 className="text-3xl font-bold text-emerald-700">
              Bean Machine
            </h1>

          </div>


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
                className="border border-emerald-400 p-3 w-full rounded bg-white text-black focus:ring-2 focus:ring-emerald-300"
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
                className="border border-emerald-400 p-3 w-full rounded bg-white text-black focus:ring-2 focus:ring-emerald-300"
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



        {/* COFFEE IMAGE PANEL */}

        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:"url('/coffee.jpg')"
          }}
        />

      </div>

    </main>
  )
}