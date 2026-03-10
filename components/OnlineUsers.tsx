"use client"

import { useEffect,useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

const pathname = usePathname()

const { users,roles,userRoles } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>(()=>{

if(typeof window !== "undefined"){

const cache = sessionStorage.getItem("onlineUsers")

if(cache) return JSON.parse(cache)

}

return []

})

/* username resolver */

function resolveUsername(id:string){

const profile = users.find(u=>u.id===id)

if(profile?.username){

sessionStorage.setItem(
"username_"+id,
profile.username
)

return profile.username

}

/* fallback cache */

const cached = sessionStorage.getItem("username_"+id)

if(cached) return cached

return "User"

}

/* readable page names */

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

useEffect(()=>{

let channel:RealtimeChannel

async function startPresence(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

channel = supabase.channel("online-users",{
config:{
presence:{ key:user.id }
}
})

channel.subscribe(async status=>{

if(status !== "SUBSCRIBED") return

await channel.track({
user_id:user.id,
page:pathname
})

})

channel.on("presence",{event:"sync"},()=>{

const state = channel.presenceState()

const map:any = {}

/* dedupe tabs */

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=>{

map[entry.user_id] = entry

})

})

const list = Object.values(map)

setOnlineUsers(prev=>{

if(JSON.stringify(prev) === JSON.stringify(list)){
return prev
}

sessionStorage.setItem(
"onlineUsers",
JSON.stringify(list)
)

return list

})

})

}

startPresence()

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

const roleId = userRoles[u.user_id]
const role = roles.find(r=>r.id===roleId)

return(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-500"></div>

<span className="font-medium">
{resolveUsername(u.user_id)}
</span>

</div>

<div className="flex items-center gap-6 text-sm">

<span className="text-emerald-700">
{role?.name || "No Role"}
</span>

<span className="text-gray-500 italic">
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