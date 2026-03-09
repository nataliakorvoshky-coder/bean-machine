"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

const PresenceContext = createContext<any>({})

let channel: any = null

export function PresenceProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const [presence, setPresence] = useState<any>({})

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

  }, [])

  useEffect(() => {

    async function updateLocation() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname
      })

      const state = channel.presenceState()
      setPresence({ ...state })

    }

    updateLocation()

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