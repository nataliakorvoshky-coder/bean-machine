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
  const [status, setStatus] = useState<string>("active")

  useEffect(() => {

    let idleTimer: any

    async function init() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      if (channel) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      const refresh = () => {
        const state = channel.presenceState()
        setPresence(state as PresenceState)
      }

      channel
        .on("presence", { event: "sync" }, refresh)
        .on("presence", { event: "join" }, refresh)
        .on("presence", { event: "leave" }, refresh)
        .subscribe(async (statusResp: string) => {

          if (statusResp === "SUBSCRIBED") {

            await channel.track({
              id: user.id,
              page: pathname,
              status
            })

            refresh()

          }

        })

    }

    init()

    function setActive() {

      setStatus("active")

      clearTimeout(idleTimer)

      idleTimer = setTimeout(() => {
        setStatus("idle")
      }, 60000)

    }

    window.addEventListener("mousemove", setActive)
    window.addEventListener("keydown", setActive)

    setActive()

    return () => {

      window.removeEventListener("mousemove", setActive)
      window.removeEventListener("keydown", setActive)

    }

  }, [])

  useEffect(() => {

    async function update() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user || !channel) return

      await channel.track({
        id: user.id,
        page: pathname,
        status
      })

      const state = channel.presenceState()
      setPresence(state as PresenceState)

    }

    update()

  }, [pathname, status])

  return (

    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence() {
  return useContext(PresenceContext)
}