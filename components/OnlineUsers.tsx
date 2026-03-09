"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

function pageName(page?:string){

if(!page) return ""

if(page.includes("dashboard")) return "Dashboard"
if(page.includes("admin")) return "Admin"
if(page.includes("settings")) return "Settings"

return ""

}

export default function OnlineUsers(){

const { presence } = usePresence()
const { users } = useUserData()

const onlineIds = Object.keys(presence)

const onlineUsers = users.filter((u:any)=> onlineIds.includes(u.id))

return(

<div className="bg-white p-8 rounded-xl shadow w-[420px]">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{onlineUsers.length===0 && (
<p className="text-gray-400 text-sm">
No users online
</p>
)}

{onlineUsers.map((u:any)=>{

const state = presence[u.id]?.[0]

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username ?? "User"}
</span>

<div className="flex items-center gap-2">

<div className="w-3 h-3 rounded-full bg-green-400"></div>

<span className="text-sm text-gray-500">
{pageName(state?.page)}
</span>

</div>

</div>

)

})}

</div>

</div>

)

}