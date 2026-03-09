"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any[]>

const PresenceContext = createContext<PresenceState>({})

let channel: any = null

export function PresenceProvider({
  children
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const [presence, setPresence] = useState<PresenceState>({})

  useEffect(() => {

    async function init() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (!channel) {

        channel = supabase.channel("online-users", {
          config: {
            presence: { key: user.id }
          }
        })

        const updatePresence = () => {
          const state = channel.presenceState()
          setPresence({ ...state })
        }

        channel
          .on("presence", { event: "sync" }, updatePresence)
          .on("presence", { event: "join" }, updatePresence)
          .on("presence", { event: "leave" }, updatePresence)
          .subscribe(async (status: string) => {

            if (status === "SUBSCRIBED") {

              await channel.track({
                id: user.id,
                page: pathname
              })

              updatePresence()

            }

          })

      }

    }

    init()

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