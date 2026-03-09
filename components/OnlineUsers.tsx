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

const [cachedPresence,setCachedPresence] = useState<any>({})
const [ready,setReady] = useState(false)

/* load cached presence before first paint */

useEffect(()=>{

try{

const stored = sessionStorage.getItem("presence-cache")

if(stored){
setCachedPresence(JSON.parse(stored))
}

}catch{}

requestAnimationFrame(()=>{
setReady(true)
})

},[])

/* update cache */

useEffect(()=>{

if(Object.keys(presence).length>0){

setCachedPresence(presence)

try{
sessionStorage.setItem(
"presence-cache",
JSON.stringify(presence)
)
}catch{}

}

},[presence])

if(!ready) return null

const state =
Object.keys(presence).length>0
? presence
: cachedPresence

const connections = Object.values(state).flat()

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

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

<span className="font-medium">
{user.username}
</span>

</div>

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