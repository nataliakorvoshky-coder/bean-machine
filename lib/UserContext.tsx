"use client"

import { createContext, useContext, useState } from "react"

type UserContextType = {
  username: string
  setUsername: (name: string) => void
}

const UserContext = createContext<UserContextType>({
  username: "",
  setUsername: () => {}
})

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [username, setUsername] = useState("Loading...")

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(){
  return useContext(UserContext)
}