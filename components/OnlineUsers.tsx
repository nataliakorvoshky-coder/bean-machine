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
              user_id: user.id
            })

            // force initial update
            updatePresence()

          }

        })

    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }

  }, [])

  /* flatten presence state */

  const activeUsers = Object.values(presence)
    .flat()
    .map((p: any) => p.user_id)

  return (

    <div className="bg-white p-8 rounded-xl shadow w-[420px]">

      <h2 className="font-semibold mb-6 text-emerald-700">
        Online Users
      </h2>

      <div className="space-y-3">

        {users
          .filter((u: any) => activeUsers.includes(u.id))
          .map((u: any) => (

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

        ))}

        {activeUsers.length === 0 && (
          <p className="text-sm text-gray-500">
            No users online
          </p>
        )}

      </div>

    </div>

  )

}