"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

const pathname = usePathname()

const { users, roles, userRoles } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])

function pageName(path:string){

if(path.startsWith("/admin")) return "Admin Dashboard"
if(path.includes("dashboard")) return "Dashboard"
if(path.includes("employees")) return "Employees"
if(path.includes("submit-hours")) return "Submit Hours"
if(path.includes("inventory")) return "Stock Overview"
if(path.includes("restock")) return "Restocking"
if(path.includes("profile")) return "Profile"
if(path.includes("settings")) return "Settings"

return "Page"

}

useEffect(()=>{

let channel:RealtimeChannel

async function start(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

const userId = user.id

channel = supabase.channel("online-users",{
config:{ presence:{ key:userId } }
})

channel.on("presence",{ event:"sync" },()=>{

const state = channel.presenceState()

const list:any[] = []

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=> list.push(entry))

})

/* dedupe users */

const unique:any = {}

list.forEach(u=>{
unique[u.user_id] = u
})

setOnlineUsers(Object.values(unique))

})

await channel.subscribe()

await channel.track({
user_id:userId,
page:pathname
})

}

start()

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

{onlineUsers.map((u:any,index:number)=>{

const profile = users.find(
x=>String(x.id) === String(u.user_id)
)

const roleId = userRoles[u.user_id]

const role = roles.find(
r=>String(r.id) === String(roleId)
)

/* stable unique key */

const key = `${u.user_id}-${index}`

return(

<div
key={key}
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