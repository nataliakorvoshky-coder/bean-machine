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

const userState = state[0]?.status

return userState==="active" || userState==="idle"

})

return(

<div className="bg-white p-8 rounded-xl shadow w-[420px]">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{onlineUsers.length===0 && (

<p className="text-sm text-gray-500">
No users online
</p>

)}

{onlineUsers.map((u:any)=>{

const state = presence[String(u.id)]

const userState = state[0]?.status
const page = state[0]?.page

let color="bg-green-400"
let text="Active"

if(userState==="idle"){
color="bg-yellow-400"
text="Idle"
}

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

<div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />

<span className="text-sm text-gray-500">
{text}
</span>

</div>

</div>

)

})}

</div>

</div>

)

}
