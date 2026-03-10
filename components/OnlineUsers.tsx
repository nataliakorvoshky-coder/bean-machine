"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

const pathname = usePathname()

const { users, roles, userRoles } = useAdminData()

/* instant render cache */

const [onlineUsers,setOnlineUsers] = useState<any[]>(()=>{

if(typeof window !== "undefined"){

const cache = sessionStorage.getItem("onlineUsers")

if(cache) return JSON.parse(cache)

}

return []

})

/* convert path to readable page */

function pageName(path:string){

if(!path) return ""

if(path.includes("dashboard")) return "Dashboard"
if(path.includes("inventory")) return "Inventory"
if(path.includes("orders")) return "Orders"
if(path.includes("employees")) return "Employees"
if(path.includes("settings")) return "Settings"
if(path.includes("admin")) return "Admin"

return path

}

/* idle detection */

function getStatus(lastActive:number){

const diff = Date.now() - lastActive

if(diff < 60000) return "online"

return "idle"

}

useEffect(()=>{

let channel:RealtimeChannel | null = null

async function init(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

const userId = user.id

channel = supabase.channel("online-users",{
config:{
presence:{ key:userId }
}
})

channel.subscribe(async (status)=>{

if(status !== "SUBSCRIBED") return

await channel?.track({
user_id:userId,
page:pathname,
lastActive:Date.now()
})

})

/* track activity */

function updateActivity(){

channel?.track({
user_id:userId,
page:pathname,
lastActive:Date.now()
})

}

window.addEventListener("mousemove",updateActivity)
window.addEventListener("keydown",updateActivity)
window.addEventListener("click",updateActivity)

/* presence sync */

channel.on("presence",{event:"sync"},()=>{

if(!channel) return

const state = channel.presenceState()

const list:any[] = []

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=>{
list.push(entry)
})

})

/* dedupe users */

const unique:any = {}

list.forEach(u=>{
unique[u.user_id] = u
})

const usersOnline = Object.values(unique)

/* cache */

setOnlineUsers(usersOnline)

sessionStorage.setItem(
"onlineUsers",
JSON.stringify(usersOnline)
)

})

}

init()

return ()=>{

if(channel){
supabase.removeChannel(channel)
}

}

},[pathname])

return(

<div className="bg-white p-8 rounded-xl shadow min-h-[120px]">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Online Users
</h2>

{onlineUsers.length === 0 ?(

<p className="text-gray-500">
No users online
</p>

):( 

<div className="space-y-3">

{onlineUsers.map((u:any)=>{

/* username resolution */

const profile = users.find((x:any)=>String(x.id) === String(u.user_id))

const username = profile?.username ?? "Unknown"

/* role resolution */

const roleId = userRoles[u.user_id]

const role = roles.find((r:any)=>String(r.id) === String(roleId))

/* status */

const status = getStatus(u.lastActive)

const color =
status === "online"
? "bg-green-500"
: "bg-yellow-400"

return(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className={`w-3 h-3 rounded-full ${color}`}></div>

<span className="font-medium text-emerald-700">
{username}
</span>

</div>

<div className="flex items-center gap-6 text-sm">

<span className="text-emerald-700">
{role?.name || "No Role"}
</span>

<span className="text-emerald-700 italic">
{pageName(u.page)}
</span>

</div>

</div>

)

})}

</div>

)}

</div>

)

}