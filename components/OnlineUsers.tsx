"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

type PresenceState = Record<string, any[]>

export default function OnlineUsers() {

  const { users } = useUserData()

  const [presence, setPresence] = useState<PresenceState>({})

  useEffect(() => {

    let channel: any

    async function initPresence() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) return

      channel = supabase.channel("online-users", {
        config: {
          presence: { key: user.id }
        }
      })

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState()
          setPresence({ ...state })
        })
        .on("presence", { event: "join" }, () => {
          const state = channel.presenceState()
          setPresence({ ...state })
        })
        .on("presence", { event: "leave" }, () => {
          const state = channel.presenceState()
          setPresence({ ...state })
        })
        .subscribe(async (status: string) => {

          if (status === "SUBSCRIBED") {

            await channel.track({
              id: user.id
            })

          }

        })

    }

    initPresence()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }

  }, [])

  /* Flatten presence payload */

  const connections = Object.values(presence).flat()

  return (

    <div className="bg-white p-8 rounded-xl shadow w-[420px]">

      <h2 className="font-semibold mb-6 text-emerald-700">
        Online Users
      </h2>

      <div className="space-y-3">

        {users.map((u: any) => {

          const online = connections.find((p: any) => p?.id === u.id)

          const color = online ? "bg-green-400" : "bg-gray-400"
          const text = online ? "Active" : "Offline"

          return (

            <div
              key={u.id}
              className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
            >

              <span className="font-medium">
                {u.username ?? "User"}
              </span>

              <div className="flex items-center gap-2">

                <div className={`w-3 h-3 rounded-full ${color}`} />

                <span className="text-sm text-gray-500">
                  {text}
                </span>

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}