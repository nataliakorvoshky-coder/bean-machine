"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"
import type { RealtimeChannel } from "@supabase/supabase-js"

type PresenceUser = {
  id: string
  page?: string
}

type PresenceState = Record<string, PresenceUser[]>

const PresenceContext = createContext<PresenceState>({})

let channel: RealtimeChannel | null = null

export function PresenceProvider({ children }: { children: ReactNode }) {

  const pathname = usePathname()

  const [presence, setPresence] = useState<PresenceState>(() => {

    if (typeof window !== "undefined") {

      const stored = sessionStorage.getItem("presence")

      if (stored) {
        try {
          return JSON.parse(stored) as PresenceState
        } catch {
          return {}
        }
      }

    }

    return {}

  })

  useEffect(() => {

    async function start() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (channel) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      const update = () => {

        if (!channel) return

        const state = channel.presenceState() as PresenceState

        setPresence(state)

        sessionStorage.setItem(
          "presence",
          JSON.stringify(state)
        )

      }

      channel
        .on("presence", { event: "sync" }, update)
        .on("presence", { event: "join" }, update)
        .on("presence", { event: "leave" }, update)
        .subscribe(async (status) => {

          if (status === "SUBSCRIBED" && channel) {

            await channel.track({
              id: user.id,
              page: pathname
            })

            update()

          }

        })

    }

    start()

  }, [])

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

  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  )

}

export function usePresence() {
  return useContext(PresenceContext)
}