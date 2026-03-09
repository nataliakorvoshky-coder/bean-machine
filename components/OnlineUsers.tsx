"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useEffect, useState } from "react"

function pageLabel(page?: string){

  if(!page) return "Online"

  if(page.includes("dashboard")) return "Dashboard"
  if(page.includes("admin")) return "Admin Panel"
  if(page.includes("settings")) return "Settings"

  return "Online"

}

export default function OnlineUsers({ users }:{ users:any[] }){

const presence = usePresence()

/* cache last presence to prevent flicker */

const [cachedPresence,setCachedPresence] = useState<any>(null)

useEffect(()=>{

if(Object.keys(presence).length>0){
setCachedPresence(presence)
}

},[presence])

/* choose active presence */

const state = Object.keys(presence).length>0
? presence
: cachedPresence

if(!state) return null

/* flatten connections */

const connections = Object.values(state).flat()

/* remove duplicate connections */

const uniqueConnections = Array.from(
new Map(connections.map((c:any)=>[c.id,c])).values()
)

return(

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{uniqueConnections.map((conn:any)=>{

const user = users.find((u:any)=>u.id===conn.id)

if(!user) return null

return(

<div
key={conn.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

{/* LEFT SIDE */}

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

<span className="font-medium">
{user.username}
</span>

</div>

{/* RIGHT SIDE */}

<span className="text-sm text-gray-500">
{pageLabel(conn.page)}
</span>

</div>

)

})}

</div>

</div>

)

}