"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

const PresenceContext = createContext<any>({})

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [presence, setPresence] = useState({})

  useEffect(() => {

    let channel: any

    async function start() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      const update = () => {
        const state = channel.presenceState()
        setPresence({ ...state })
      }

      channel
        .on("presence", { event: "sync" }, update)
        .on("presence", { event: "join" }, update)
        .on("presence", { event: "leave" }, update)
        .subscribe(async (status: any) => {

          if (status === "SUBSCRIBED") {

            await channel.track({
              id: user.id,
              page: pathname
            })

            update()

          }

        })

    }

    start()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }

  }, [])

  useEffect(() => {

    async function updatePage() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      const channel = supabase.getChannels().find(
        (c: any) => c.topic === "online-users"
      )

      if (!channel) return

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