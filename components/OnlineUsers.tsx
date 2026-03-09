"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

function pageLabel(page?: string){

  if(!page) return "Dashboard"

  if(page.includes("dashboard")) return "Dashboard"
  if(page.includes("admin")) return "Admin Panel"
  if(page.includes("settings")) return "Settings"

  return "Online"

}

export default function OnlineUsers({ users }:{ users:any[] }){

const presence = usePresence()

const [currentUser,setCurrentUser] = useState<string | null>(null)

/* detect current user instantly */

useEffect(()=>{

async function load(){

const { data } = await supabase.auth.getUser()

if(data?.user){
setCurrentUser(data.user.id)
}

}

load()

},[])

/* flatten presence */

const connections = Object.values(presence).flat()

/* remove duplicate connections */

const unique = Array.from(
new Map(connections.map((c:any)=>[c.id,c])).values()
)

return(

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{/* current user appears instantly */}

{currentUser && (

<div className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg">

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

<span className="font-medium">
{users.find(u=>u.id===currentUser)?.username}
</span>

</div>

<span className="text-sm text-gray-500">
Dashboard
</span>

</div>

)}

{/* other users from presence */}

{unique
.filter((c:any)=>c.id!==currentUser)
.map((conn:any)=>{

const user = users.find((u:any)=>u.id===conn.id)
if(!user) return null

return(

<div
key={conn.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

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