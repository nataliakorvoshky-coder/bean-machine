"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

type PresenceState = Record<string, any[]>

type Activity = {
id:string
username:string
action:string
type:string
created_at:string
}

export default function DashboardPage(){

const { users } = useUserData()

const [presence,setPresence] = useState<PresenceState>({})
const [logs,setLogs] = useState<Activity[]>([])

/* ONLINE USERS PRESENCE */

useEffect(()=>{

let channel:any

async function startPresence(){

const { data } = await supabase.auth.getUser()
const user = data?.user
if(!user) return

channel = supabase.channel("online-users",{
config:{presence:{key:user.id}}
})

channel
.on("presence",{event:"sync"},()=>{
setPresence(channel.presenceState())
})
.subscribe(async(status:string)=>{

if(status==="SUBSCRIBED"){

await channel.track({
id:user.id,
page:"dashboard",
status:"active"
})

}

})

}

startPresence()

return ()=>{
if(channel) supabase.removeChannel(channel)
}

},[])

/* LOAD ACTIVITY */

async function loadActivity(){

const res = await fetch("/api/activity")
const data = await res.json()

setLogs(data.logs || [])

}

/* REALTIME ACTIVITY */

useEffect(()=>{

loadActivity()

const channel = supabase
.channel("activity-feed")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"activity_log"
},
(payload)=>{
setLogs((prev)=>[payload.new as Activity,...prev])
}
)
.subscribe()

return ()=>{
supabase.removeChannel(channel)
}

},[])

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Dashboard
</h1>

<div className="flex gap-12">

{/* ONLINE USERS */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const state = presence[u.id]

let color="bg-gray-400"
let text="Offline"

if(state){

const s = state[0]?.status

if(s==="active"){
color="bg-green-400"
text="Active"
}

if(s==="idle"){
color="bg-yellow-400"
text="Idle"
}

}

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username ?? "User"}
</span>

<div className="flex items-center gap-2">

<div className={`w-3 h-3 rounded-full ${color}`} />

<span className="text-sm text-gray-500">
{text}
</span>

</div>

</div>

)

})}

</div>

</div>

{/* ACTIVITY FEED */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Activity Feed
</h2>

<div className="space-y-3 max-h-[300px] overflow-y-auto">

{logs.map((log)=>(

<div
key={log.id}
className="border border-emerald-200 rounded p-3"
>

<div className="text-sm font-semibold">
{log.username}
</div>

<div className="text-xs text-gray-600">
{log.action}
</div>

<div className="text-xs text-gray-400">
{log.type} • {new Date(log.created_at).toLocaleTimeString()}
</div>

</div>

))}

</div>

</div>

</div>

</div>

)

}