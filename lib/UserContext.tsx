"use client"

import { createContext, useContext, useState } from "react"

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

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )

}

export function useUser() {
  return useContext(UserContext)
}