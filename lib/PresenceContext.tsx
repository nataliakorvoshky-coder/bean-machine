"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any[]>

const PresenceContext = createContext<PresenceState>({})

let channel: any = null

export function PresenceProvider({ children }: { children: ReactNode }) {

  const pathname = usePathname()
  const [presence, setPresence] = useState<PresenceState>({})

  /* create channel once */

  useEffect(() => {

    async function startPresence() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (!channel) {

        channel = supabase.channel("online-users", {
          config: { presence: { key: user.id } }
        })

        channel.subscribe(async (status: string) => {

          if (status === "SUBSCRIBED") {

            await channel.track({
              id: user.id,
              page: pathname
            })

          }

        })

      }

    }

    startPresence()

  }, [])

  /* update page when navigating */

  useEffect(() => {

    async function updatePage() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname
      })

    }

    updatePage()

  }, [pathname])

  /* force UI refresh every second */

  useEffect(() => {

    const interval = setInterval(() => {

      if (!channel) return

      const state = channel.presenceState()

      setPresence({ ...state })

    }, 1000)

    return () => clearInterval(interval)

  }, [])

  return (

    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence() {
  return useContext(PresenceContext)
}