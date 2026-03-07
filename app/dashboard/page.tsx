"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }

    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      {user && <p>Logged in as: {user.email}</p>}

      <button onClick={logout}>Logout</button>
    </main>
  )
}