"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any>

interface PresenceContextType {
  presence: PresenceState
}

const PresenceContext = createContext<PresenceContextType>({
  presence: {}
})

let channel: any = null
let initialized = false

export function PresenceProvider({
  children
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const [presence, setPresence] = useState<PresenceState>({})

  /* CREATE CHANNEL ONCE */

  useEffect(() => {

    async function init() {

      if (initialized) return

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      channel = supabase.channel("online-users", {
        config: {
          presence: { key: user.id }
        }
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
              online_at: new Date().toISOString()
            })

          }

        })

      initialized = true

    }

    init()

  }, [])

  /* UPDATE PAGE LOCATION */

  useEffect(() => {

    async function updatePage() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname,
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