"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageLabel(page?:string){

if(!page) return "Active"

if(page.includes("dashboard")) return "Dashboard"
if(page.includes("admin")) return "Admin"
if(page.includes("settings")) return "Settings"

return "Active"

}

export default function OnlineUsers(){

const presence = usePresence()
const { users } = useUserData()

const connections = Object.values(presence).flat()

const unique = Array.from(
new Map(connections.map((c:any)=>[c.id,c])).values()
)

return(

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{unique.map((conn:any)=>{

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