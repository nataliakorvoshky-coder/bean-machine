"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

const PresenceContext = createContext<any>({})

let presenceChannel: any = null

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  const [presence, setPresence] = useState({})

  /* create channel once */

  useEffect(() => {

    async function start() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (presenceChannel) return

      presenceChannel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      const update = () => {
        const state = presenceChannel.presenceState()
        setPresence({ ...state })
      }

      presenceChannel
        .on("presence", { event: "sync" }, update)
        .on("presence", { event: "join" }, update)
        .on("presence", { event: "leave" }, update)
        .subscribe(async (status: any) => {

          if (status === "SUBSCRIBED") {

            await presenceChannel.track({
              id: user.id,
              page: pathname
            })

            update()

          }

        })

    }

    start()

  }, [])

  /* update location when page changes */

  useEffect(() => {

    async function updateLocation() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !presenceChannel) return

      await presenceChannel.track({
        id: user.id,
        page: pathname
      })

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