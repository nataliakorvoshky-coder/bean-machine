"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/lib/UserDataContext"
import { startPresence } from "@/lib/presence"

export default function OnlineUsers() {

  const { users } = useUserData()

  const [presence, setPresence] = useState<any>({})

  useEffect(() => {

    startPresence((state) => {
      setPresence(state)
    })

  }, [])

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