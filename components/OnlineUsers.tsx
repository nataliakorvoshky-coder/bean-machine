"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageLabel(page?: string) {

  if (!page) return ""

  if (page.includes("dashboard")) return "Dashboard"
  if (page.includes("admin")) return "Admin"
  if (page.includes("settings")) return "Settings"

  return ""
}

function getStatus(lastActive:number){

  const now = Date.now()
  const diff = now - lastActive

  if(diff < 30000) return "active"
  if(diff < 120000) return "idle"

  return "offline"
}

export default function OnlineUsers(){

  const presence = usePresence()
  const { users } = useUserData()

  const connections = Object.values(presence).flat()

  const userPresence:Record<string,any> = {}

  connections.forEach((p:any)=>{

    if(!userPresence[p.id] || p.lastActive > userPresence[p.id].lastActive){
      userPresence[p.id] = p
    }

  })

  return(

  <div className="bg-white p-8 rounded-xl shadow w-[420px]">

  <h2 className="font-semibold mb-6 text-emerald-700">
  Online Users
  </h2>

  <div className="space-y-3">

  {users.map((u:any)=>{

    const state = userPresence[u.id]

    if(!state) return null

    const status = getStatus(state.lastActive)

    if(status === "offline") return null

    let color = "bg-green-400"

    if(status==="idle") color = "bg-yellow-400"

    return(

    <div
    key={u.id}
    className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
    >

    <span className="font-medium">
    {u.username}
    </span>

    <div className="flex items-center gap-2">

    <div className={`w-3 h-3 rounded-full ${color}`} />

    <span className="text-sm text-gray-500">
    {pageLabel(state.page)}
    </span>

    </div>

    </div>

    )

  })}

  </div>

  </div>

  )

}