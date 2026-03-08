"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {

    e.preventDefault()

    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Save cookie for admin protection
    document.cookie = `user_id=${data.user.id}; path=/`

    router.push("/admin")
  }

  return (

    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200">

      <div className="bg-white p-10 rounded-xl shadow-xl w-[420px]">

        <h1 className="text-3xl font-bold text-emerald-600 text-center mb-8">
          Login
        </h1>

        <form onSubmit={login} className="space-y-6">

          {/* EMAIL */}

          <div>
            <label className="block text-emerald-700 font-semibold mb-2">
              Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-emerald-500 p-3 w-full rounded bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter email"
            />
          </div>


          {/* PASSWORD */}

          <div>
            <label className="block text-emerald-700 font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-emerald-500 p-3 w-full rounded bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter password"
            />
          </div>


          {/* LOGIN BUTTON */}

          <button
            className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {error && (
          <p className="text-red-500 text-center mt-4">
            {error}
          </p>
        )}

      </div>

    </main>
  )
}