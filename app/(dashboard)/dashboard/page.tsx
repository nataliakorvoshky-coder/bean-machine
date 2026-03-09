"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageLabel(page?: string){

  if(!page) return ""

  if(page.includes("dashboard")) return "Dashboard"
  if(page.includes("admin")) return "Admin Panel"
  if(page.includes("settings")) return "Settings"

  return "Online"

}

export default function DashboardPage(){

const presence = usePresence()
const { users } = useUserData()

/* flatten realtime connections */

const connections = Object.values(presence).flat()

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Dashboard
</h1>

<div className="flex gap-12">

{/* ONLINE USERS */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const active = connections.find(
(p:any)=>p.id===u.id
)

if(!active) return null

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username}
</span>

<div className="flex items-center gap-2">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

<span className="text-sm text-gray-500">
• {pageLabel(active.page)}
</span>

</div>

</div>

)

})}

</div>

</div>

{/* ACTIVITY PANEL */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Activity Feed
</h2>

<p className="text-gray-500 text-sm">
No activity yet
</p>

</div>

</div>

</div>

)

}