"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import { usePathname } from "next/navigation"

export default function OnlineUsers(){

const pathname = usePathname()

const { users, roles, userRoles, load } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])

function pageName(path:string){

if(path.includes("dashboard")) return "Dashboard"
if(path.includes("employees")) return "Employees"
if(path.includes("inventory")) return "Inventory"
if(path.includes("settings")) return "Settings"
if(path.includes("admin")) return "Admin"

return "Page"

}

useEffect(()=>{

let channel:any

async function start(){

const { data } = await supabase.auth.getUser()

const user = data?.user
if(!user) return

channel = supabase.channel("online-users",{
config:{
presence:{ key:user.id }
}
})

channel.on("presence",{ event:"sync" },()=>{

const state = channel.presenceState()

const list:any[] = []

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=> list.push(entry))

})

setOnlineUsers(list)

})

channel.subscribe(async (status: "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR")=>{

if(status !== "SUBSCRIBED") return

await channel.track({
user_id:user.id,
page:pathname
})

})

/* update location */

await channel.track({
user_id:user.id,
page:pathname
})

}

/* live role updates */

const roleChannel = supabase
.channel("role-live")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"user_roles"
},
async ()=>{
await load()
}
)
.subscribe()

start()

return ()=>{

if(channel){
supabase.removeChannel(channel)
}

supabase.removeChannel(roleChannel)

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

const profile = users.find(x=>String(x.id)===String(u.user_id))

const roleId = userRoles[u.user_id]

const role = roles.find(r=>String(r.id)===String(roleId))

return(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-500"></div>

<span className="font-medium text-emerald-700">
{profile?.username || "User"}
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