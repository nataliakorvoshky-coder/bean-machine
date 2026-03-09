"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageLabel(page?: string){

  if(!page) return "Online"

  if(page.includes("dashboard")) return "Dashboard"
  if(page.includes("admin")) return "Admin Panel"
  if(page.includes("settings")) return "Settings"

  return "Online"

}

export default function DashboardPage(){

const presence = usePresence()
const { users } = useUserData()

/* flatten presence */

const activeConnections = Object.values(presence).flat()

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

{activeConnections.map((conn:any)=>{

const user = users.find((u:any)=>u.id === conn.id)

if(!user) return null

return(

<div
key={conn.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

{/* LEFT */}

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

<span className="font-medium">
{user.username}
</span>

</div>

{/* RIGHT */}

<span className="text-sm text-gray-500">
{pageLabel(conn.page)}
</span>

</div>

)

})}

</div>

</div>

{/* ACTIVITY */}

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