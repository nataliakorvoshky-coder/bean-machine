"use client"

import { usePermission } from "@/lib/usePermission"
import { useUserData } from "@/lib/UserDataContext"
import { usePresence } from "@/lib/PresenceContext"

export default function AdminPage(){

  usePermission("admin")

  const { users } = useUserData()
  const connections = usePresence()

  return(

    <div className="w-[1000px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Admin Dashboard
      </h1>

      <div className="bg-white p-8 rounded-xl shadow">

        <h2 className="font-semibold text-emerald-700 mb-6">
          Current Users
        </h2>

        <div className="space-y-3">

          {users.map((u:any)=>{

            const online = connections.find((c:any)=>c.id===u.id)

            return(

              <div
                key={u.id}
                className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
              >

                <span className="font-medium">
                  {u.username}
                </span>

                <span className="text-sm text-gray-500">
                  {online ? "Online" : "Offline"}
                </span>

              </div>

            )

          })}

        </div>

      </div>

    </div>

  )

}