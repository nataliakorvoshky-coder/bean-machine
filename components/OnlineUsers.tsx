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

async function start(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

channel = supabase.channel("online-users",{
config:{presence:{key:user.id}}
})

channel.on("presence",{event:"sync"},()=>{

const state = channel.presenceState()

const list:any[] = []

Object.values(state).forEach((entries:any)=>{
entries.forEach((entry:any)=>list.push(entry))
})

setOnlineUsers(list)

})

channel.on("presence",{event:"join"},()=>{

const state = channel.presenceState()

const list:any[] = []

Object.values(state).forEach((entries:any)=>{
entries.forEach((entry:any)=>list.push(entry))
})

setOnlineUsers(list)

})

channel.subscribe(async (status:string)=>{

if(status !== "SUBSCRIBED") return

await channel.track({
user_id:user.id,
page:pathname
})

})

}

start()

return ()=>{

if(channel){
supabase.removeChannel(channel)
}

}

},[pathname])

function username(id:string){
const u = users.find((x:any)=>x.id===id)
return u?.username || "Unknown"
}

function role(id:string){
const roleId = userRoles[id]
const r = roles.find((x:any)=>x.id===roleId)
return r?.name || "No Role"
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
{username(u.user_id)}
</span>

</div>

<div className="flex gap-4 text-sm text-emerald-700">

<span>{role(u.user_id)}</span>

<span className="text-gray-500 italic">
{u.page}
</span>

</div>

</div>

))}

{onlineUsers.length === 0 && (
<p className="text-gray-400">No users online</p>
)}

</div>

</div>

)

}