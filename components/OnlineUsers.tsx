"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

export default function OnlineUsers(){

const { users } = useUserData()

const [presence,setPresence] = useState<any>({})
const [status,setStatus] = useState("active")

const channelRef = useRef<any>(null)
const userIdRef = useRef<string | null>(null)

useEffect(()=>{

let idleTimer:any

function setActive(){

setStatus("active")

clearTimeout(idleTimer)

idleTimer = setTimeout(()=>{

setStatus("idle")

},60000)

}

window.addEventListener("mousemove",setActive)
window.addEventListener("keydown",setActive)

setActive()

return ()=>{

window.removeEventListener("mousemove",setActive)
window.removeEventListener("keydown",setActive)

}

},[])

/* CREATE CHANNEL ONLY ONCE */

useEffect(()=>{

async function startPresence(){

const { data } = await supabase.auth.getUser()
const user = data.user

if(!user) return

userIdRef.current = user.id

const channel = supabase.channel("online-users",{
config:{
presence:{
key:user.id
}
}
})

channel
.on("presence",{ event:"sync" },()=>{

const state = channel.presenceState()

setPresence(state)

})

.subscribe(async(resp)=>{

if(resp==="SUBSCRIBED"){

await channel.track({
status:"active"
})

}

})

channelRef.current = channel

}

startPresence()

return ()=>{

if(channelRef.current){
supabase.removeChannel(channelRef.current)
}

}

},[])

/* UPDATE STATUS WITHOUT RECREATING CHANNEL */

useEffect(()=>{

if(!channelRef.current) return

channelRef.current.track({
status
})

},[status])

return(

<div className="bg-white p-8 rounded-xl shadow w-[420px]">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const state = presence[u.id]

let color="bg-gray-400"
let text="Offline"

if(state){

const userState = state[0]?.status

if(userState==="active"){
color="bg-green-400"
text="Active"
}

if(userState==="idle"){
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

)

}
