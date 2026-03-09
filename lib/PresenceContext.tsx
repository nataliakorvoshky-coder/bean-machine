"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

type PresenceState = Record<string, any>

interface PresenceContextType {
  presence: PresenceState
}

const PresenceContext = createContext<PresenceContextType>({
  presence: {}
})

let channel: any = null

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [presence, setPresence] = useState<PresenceState>({})

  useEffect(() => {

    async function initPresence() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (!channel) {

        channel = supabase.channel("online-users", {
          config: { presence: { key: user.id } }
        })

        channel
          .on("presence", { event: "sync" }, () => {
            setPresence(channel.presenceState())
          })
          .on("presence", { event: "join" }, () => {
            setPresence(channel.presenceState())
          })
          .on("presence", { event: "leave" }, () => {
            setPresence(channel.presenceState())
          })
          .subscribe(async (status: string) => {

            if (status === "SUBSCRIBED") {

              await channel.track({
                id: user.id,
                page: pathname,
                status: "active",
                online_at: new Date().toISOString()
              })

            }

          })

      }

      /* HEARTBEAT (prevents ghost offline state) */

      setInterval(async () => {

        if (!channel) return

        await channel.track({
          id: user.id,
          page: pathname,
          status: "active",
          online_at: new Date().toISOString()
        })

      }, 15000)

    }

    initPresence()

  }, [])

  /* Update page location */

  useEffect(() => {

    async function updatePage() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname,
        status: "active",
        online_at: new Date().toISOString()
      })

    }

    updatePage()

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