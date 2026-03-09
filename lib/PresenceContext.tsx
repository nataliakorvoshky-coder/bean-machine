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

    async function startPresence() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (!channel) {

        channel = supabase.channel("online-users", {
          config: {
            presence: { key: user.id }
          }
        })

        const update = () => {
          const state = channel.presenceState()
          setPresence({ ...state })
        }

        channel
          .on("presence", { event: "sync" }, update)
          .on("presence", { event: "join" }, update)
          .on("presence", { event: "leave" }, update)
          .subscribe(async (status: string) => {

            if (status === "SUBSCRIBED") {

              await channel.track({
                id: user.id,
                page: pathname,
                lastSeen: Date.now()
              })

              update()

            }

          })

      }

    }

    startPresence()

  }, [])

  /* update location instantly when navigating */

  useEffect(() => {

    async function updateLocation() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname,
        lastSeen: Date.now()
      })

    }

    updateLocation()

  }, [pathname])

  /* detect tab close → instant offline */

  useEffect(() => {

    const handleUnload = () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }

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