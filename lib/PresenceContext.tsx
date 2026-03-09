"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, { id: string; page?: string }[]>

interface PresenceContextType {
  presence: PresenceState
}

const PresenceContext = createContext<PresenceContextType>({
  presence: {}
})

let channel: ReturnType<typeof supabase.channel> | null = null

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

        channel
          .on("presence", { event: "sync" }, () => {

            const state = channel?.presenceState() as PresenceState
            setPresence({ ...state })

          })
          .subscribe(async status => {

            if (status === "SUBSCRIBED" && channel) {

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
    <PresenceContext.Provider value={{ presence }}>
      {children}
    </PresenceContext.Provider>
  )

}

export function usePresence() {
  return useContext(PresenceContext)
}