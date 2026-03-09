"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const PresenceContext = createContext<any>(null)

let channel: any = null

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const [presence, setPresence] = useState<any>({})

  useEffect(() => {

    async function init() {

      if (channel) return

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      const update = () => {
        setPresence({ ...channel.presenceState() })
      }

      channel
        .on("presence", { event: "sync" }, update)
        .on("presence", { event: "join" }, update)
        .on("presence", { event: "leave" }, update)
        .subscribe(async (status: string) => {

          if (status === "SUBSCRIBED") {

            await channel.track({
              user_id: user.id
            })

            update()

          }

        })

    }

    init()

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