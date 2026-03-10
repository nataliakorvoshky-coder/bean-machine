"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"
import { useAdminData } from "@/lib/AdminDataContext"
import { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

const pathname = usePathname()

const { users,roles,userRoles } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])

useEffect(()=>{

let channel:RealtimeChannel

async function init(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

channel = supabase.channel("online-users",{
config:{presence:{key:user.id}}
})

/* PRESENCE LISTENER */

channel.on("presence",{event:"sync"},()=>{

const state = channel.presenceState()

const online:any[] = []

Object.values(state).forEach((entries:any)=>{

entries.forEach((entry:any)=>{
online.push(entry)
})

})

setOnlineUsers(online)

})

/* SUBSCRIBE */

channel.subscribe(async (status:string)=>{

if(status !== "SUBSCRIBED") return

await channel.track({
user_id:user.id,
page:pathname
})

})

}

init()

return ()=>{

if(channel){
supabase.removeChannel(channel)
}

}

},[pathname])

function getUsername(id:string){

const u = users.find((x:any)=>x.id===id)

return u?.username || "Unknown"

}

function getRole(id:string){

const roleId = userRoles[id]

const role = roles.find((r:any)=>r.id===roleId)

return role?.name || "No Role"

}

return(

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Online Users
</h2>

<div className="space-y-3">

{onlineUsers.map((u:any)=>(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className="w-3 h-3 bg-green-500 rounded-full"></div>

<span className="font-medium">
{getUsername(u.user_id)}
</span>

</div>

<div className="text-sm text-emerald-700 flex gap-4">

<span>{getRole(u.user_id)}</span>

<span className="italic text-gray-500">
{u.page}
</span>

</div>

</div>

))}

{onlineUsers.length === 0 && (

<p className="text-gray-400">
No users online
</p>

)}

</div>

</div>

)

}