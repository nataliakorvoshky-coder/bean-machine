"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type Connection = {
  id: string
  page?: string
}

const PresenceContext = createContext<Connection[]>([])

let channel: any = null

export function PresenceProvider({
  children
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()

  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {

    async function start() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) return

      if (!channel) {

        channel = supabase.channel("online-users", {
          config: { presence: { key: user.id } }
        })

        const update = () => {

          const state = channel.presenceState()

          const flat = Object.values(state).flat() as Connection[]

          setConnections(flat)

        }

        channel
          .on("presence", { event: "sync" }, update)
          .on("presence", { event: "join" }, update)
          .on("presence", { event: "leave" }, update)
          .subscribe(async (status: string) => {

            if (status === "SUBSCRIBED") {

              await channel.track({
                id: user.id,
                page: pathname
              })

              update()

            }

          })

      }

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

    <PresenceContext.Provider value={connections}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence() {
  return useContext(PresenceContext)
}