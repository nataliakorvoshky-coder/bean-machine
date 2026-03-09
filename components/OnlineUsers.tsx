"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

export default function OnlineUsers(){

const { users } = useUserData()
const { presence } = usePresence()

function pageLabel(path:string){

if(!path) return "Unknown"

if(path.includes("dashboard")) return "Dashboard"
if(path.includes("admin")) return "Admin Panel"
if(path.includes("settings")) return "Settings"

return "Other"

}

const onlineUsers = users.filter((u:any)=>{

const state = presence[String(u.id)]

if(!state || !state.length) return false

return true

})

return(

<div className="bg-white p-8 rounded-xl shadow w-[420px]">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{onlineUsers.map((u:any)=>{

const state = presence[String(u.id)]

const userState = state[0]?.status
const page = state[0]?.page

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<div>

<div className="font-medium">
{u.username ?? "User"}
</div>

<div className="text-xs text-gray-500">
{pageLabel(page)}
</div>

</div>

<div className="flex items-center gap-2">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

<span className="text-sm text-gray-500">
{userState}
</span>

</div>

</div>

)

})}

</div>

</div>

)

}
