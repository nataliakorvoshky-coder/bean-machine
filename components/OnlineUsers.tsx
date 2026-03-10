"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

const pathname = usePathname()

const { roles,userRoles } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])
const [usernames,setUsernames] = useState<Record<string,string>>({})

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

async function loadUsernames(ids:string[]){

const missing = ids.filter(id => !usernames[id])

if(missing.length === 0) return

const { data } = await supabase
.from("profiles")
.select("id,username")
.in("id",missing)

if(!data) return

const map:Record<string,string> = {}

data.forEach(u=>{
map[u.id] = u.username
})

setUsernames(prev=>({
...prev,
...map
}))

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

/* subscribe */

channel.subscribe(async status=>{

if(status !== "SUBSCRIBED") return

await channel.track({
user_id:user.id,
page:pathname
})

})

/* read presence */

channel.on("presence",{event:"sync"},()=>{

const state = channel.presenceState()

const users:any[] = []

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=>{

users.push(entry)

})

})

/* dedupe users */

const unique:any = {}

users.forEach(u=>{
unique[u.user_id] = u
})

const list = Object.values(unique)

setOnlineUsers(list)

loadUsernames(list.map((u:any)=>u.user_id))

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
{usernames[u.user_id] || "Loading..."}
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