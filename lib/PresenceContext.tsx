"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any[]>

const PresenceContext = createContext<PresenceState>({})

export function PresenceProvider({
children
}:{
children:React.ReactNode
}){

const pathname = usePathname()
const [presence,setPresence] = useState<PresenceState>({})

/* load cached presence after mount */

useEffect(()=>{

try{

const cached = localStorage.getItem("presence-cache")

if(cached){
setPresence(JSON.parse(cached))
}

}catch{}

},[])

/* start realtime */

useEffect(()=>{

let channel:any

async function start(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

channel = supabase.channel("online-users",{
config:{presence:{key:user.id}}
})

const update = ()=>{

const state = channel.presenceState()

setPresence({...state})

try{
localStorage.setItem(
"presence-cache",
JSON.stringify(state)
)
}catch{}

}

channel
.on("presence",{event:"sync"},update)
.on("presence",{event:"join"},update)
.on("presence",{event:"leave"},update)
.subscribe(async(status:string)=>{

if(status==="SUBSCRIBED"){

await channel.track({
id:user.id,
page:pathname
})

update()

}

})

}

start()

return ()=>{
if(channel) supabase.removeChannel(channel)
}

},[])

/* update page location */

useEffect(()=>{

async function updateLocation(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

const channel = supabase.getChannels().find(
c=>c.topic==="online-users"
)

if(!channel) return

await channel.track({
id:user.id,
page:pathname
})

}

updateLocation()

},[pathname])

return(

<PresenceContext.Provider value={presence}>
{children}
</PresenceContext.Provider>

)

}

export function usePresence(){
return useContext(PresenceContext)
}