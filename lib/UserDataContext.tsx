"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserDataType {
  users: any[]
  refreshUsers: () => Promise<void>
}

const UserDataContext = createContext<UserDataType>({
  users: [],
  refreshUsers: async () => {}
})

export function UserDataProvider({ children }: { children: React.ReactNode }) {

  const [users, setUsers] = useState<any[]>([])

  async function refreshUsers() {

    try {

      const res = await fetch("/api/admin/list-users")

      if (!res.ok) return

      const data = await res.json()

      setUsers(data.users || [])

      /* cache users so panels render instantly */

      localStorage.setItem("cachedUsers", JSON.stringify(data.users || []))

    } catch (err) {

      console.error("Failed loading users", err)

    }

  }

  useEffect(() => {

    const cached = localStorage.getItem("cachedUsers")

    if (cached) {
      setUsers(JSON.parse(cached))
    }

    refreshUsers()

  }, [])

  return (

    <UserDataContext.Provider value={{ users, refreshUsers }}>
      {children}
    </UserDataContext.Provider>

  )

}

export function useUserData() {
  return useContext(UserDataContext)
}