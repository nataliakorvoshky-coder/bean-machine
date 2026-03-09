"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageLabel(page?: string){

  if(!page) return ""

  if(page.includes("dashboard")) return "Dashboard"
  if(page.includes("admin")) return "Admin Dashboard"
  if(page.includes("settings")) return "Settings"

  return ""

}

export default function OnlineUsers(){

  const { presence } = usePresence()
  const { users } = useUserData()

  /* flatten presence payload */

  const onlineIds = Object.values(presence)
    .flat()
    .map((p:any)=>p.id)

  const onlineUsers = users.filter((u:any)=>
    onlineIds.includes(u.id)
  )

  return(

  <div className="bg-white p-8 rounded-xl shadow w-[420px]">

  <h2 className="font-semibold mb-6 text-emerald-700">
  Online Users
  </h2>

  <div className="space-y-3">

  {onlineUsers.length===0 &&(

  <p className="text-gray-400 text-sm">
  No users online
  </p>

  )}

  {onlineUsers.map((u:any)=>{

  const state = Object.values(presence)
    .flat()
    .find((p:any)=>p.id===u.id)

  return(

  <div
  key={u.id}
  className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
  >

  <span className="font-medium">
  {u.username ?? "User"}
  </span>

  <div className="flex items-center gap-2">

  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

  <span className="text-sm text-gray-500">
  {pageLabel(state?.page)}
  </span>

  </div>

  </div>

  )

  })}

  </div>

  </div>

  )

}