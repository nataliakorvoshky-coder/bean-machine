"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

type Connection = {
  id: string
  page?: string
  status?: string
}

function pageLabel(page?: string) {

  if (!page) return "Active"

  if (page.includes("dashboard")) return "Dashboard"
  if (page.includes("admin")) return "Admin"
  if (page.includes("settings")) return "Settings"

  return "Active"
}

export default function OnlineUsers() {

  const connections = usePresence() as Connection[]
  const { users } = useUserData()

  /* Remove duplicate connections */

  const uniqueConnections = Array.from(
    new Map(connections.map(c => [c.id, c])).values()
  )

  return (

    <div className="w-[420px] bg-white p-8 rounded-xl shadow">

      <h2 className="font-semibold mb-6 text-emerald-700">
        Online Users
      </h2>

      <div className="space-y-3">

        {uniqueConnections.map(conn => {

          const user = users.find((u: any) => u.id === conn.id)

          if (!user) return null

          const statusColor =
            conn.status === "idle"
              ? "bg-yellow-400"
              : "bg-green-400"

          const statusText =
            conn.status === "idle"
              ? "Idle"
              : pageLabel(conn.page)

          return (

            <div
              key={conn.id}
              className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
            >

              <div className="flex items-center gap-3">

                <div
                  className={`w-3 h-3 rounded-full ${statusColor}`}
                />

                <span className="font-medium">
                  {user.username}
                </span>

              </div>

              <span className="text-sm text-gray-500">
                {statusText}
              </span>

            </div>

          )

        })}

        {uniqueConnections.length === 0 && (

          <div className="text-sm text-gray-400">
            No users online
          </div>

        )}

      </div>

    </div>

  )

}