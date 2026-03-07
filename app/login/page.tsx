"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) alert(error.message)
    else alert("Check your email for confirmation!")
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) alert(error.message)
    else router.push("/dashboard")
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-emerald-100 overflow-hidden">

      {/* RIGHT SIDE BACKGROUND IMAGE */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 bg-no-repeat bg-right bg-contain opacity-70"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      />

      {/* LOGIN CARD */}
      <div className="relative bg-white p-8 rounded-xl shadow-lg w-80 border border-emerald-200">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-emerald-600 text-center">
          Login
        </h1>

        <input
          className="w-full border border-emerald-200 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border border-emerald-200 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="w-full bg-emerald-500 text-white p-2 rounded mb-3 hover:bg-emerald-600 transition"
          onClick={signIn}
        >
          Login
        </button>

        <button
          className="w-full border border-emerald-400 text-emerald-600 p-2 rounded hover:bg-emerald-50 transition"
          onClick={signUp}
        >
          Sign Up
        </button>

      </div>

    </main>
  )
}