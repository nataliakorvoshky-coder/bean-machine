"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface UserContextType {
  username: string | null
  setUsername: (name: string | null) => void
}

const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {}
})

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {

    async function loadUser() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single()

      if (profile?.username) {
        setUsername(profile.username)
      }

    }

    loadUser()

  }, [])

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )

}

export function useUser() {
  return useContext(UserContext)
}