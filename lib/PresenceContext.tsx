"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { startPresence, updatePresence, subscribePresence } from "@/lib/presence"

const PresenceContext = createContext<any>({ presence: {} })

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [presence, setPresence] = useState({})

  useEffect(() => {

    startPresence(pathname)

    subscribePresence(setPresence)

  }, [])

  useEffect(() => {

    updatePresence(pathname)

  }, [pathname])

  return (

    <PresenceContext.Provider value={{ presence }}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence() {
  return useContext(PresenceContext)
}