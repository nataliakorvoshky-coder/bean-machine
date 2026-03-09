"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

export default function OnlineUsers() {

  const { users } = useUserData()

  const [presence, setPresence] = useState<any>({})

  useEffect(() => {

    let channel: any

    async function init() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } }
      })

      channel
        .on("presence", { event: "sync" }, () => {
          setPresence({ ...channel.presenceState() })
        })
        .on("presence", { event: "join" }, () => {
          setPresence({ ...channel.presenceState() })
        })
        .on("presence", { event: "leave" }, () => {
          setPresence({ ...channel.presenceState() })
        })
        .subscribe(async (status: string) => {

          if (status === "SUBSCRIBED") {

            await channel.track({
              id: user.id
            })

            /* CRITICAL FIX — load current state immediately */

            setPresence({ ...channel.presenceState() })

          }

        })

    }

    init()

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

          if (!online) return null  // hide offline users

          return (

            <div
              key={u.id}
              className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
            >

              <span className="font-medium">
                {u.username ?? "User"}
              </span>

              <div className="flex items-center gap-2">

                <div className="w-3 h-3 rounded-full bg-green-400" />

                <span className="text-sm text-gray-500">
                  Active
                </span>

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}