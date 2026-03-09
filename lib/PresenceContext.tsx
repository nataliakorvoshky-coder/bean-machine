"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface PresenceType{
presence:any
}

const PresenceContext = createContext<PresenceType>({
presence:{}
})

export function PresenceProvider({children}:{children:React.ReactNode}){

const [presence,setPresence] = useState<any>({})

const pathname = usePathname()

const channelRef = useRef<any>(null)
const userIdRef = useRef<string | null>(null)

const [status,setStatus] = useState("active")

/* ---------------- IDLE DETECTION ---------------- */

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

/* ---------------- PRESENCE CHANNEL ---------------- */

useEffect(()=>{

async function initPresence(){

const { data } = await supabase.auth.getUser()

const user = data.user

if(!user) return

userIdRef.current = user.id

const channel = supabase.channel("online-users",{
config:{
presence:{ key:user.id }
}
})

channel
.on("presence",{event:"sync"},()=>{
setPresence(channel.presenceState())
})
.on("presence",{event:"join"},()=>{
setPresence(channel.presenceState())
})
.on("presence",{event:"leave"},()=>{
setPresence(channel.presenceState())
})
.subscribe(async(resp)=>{

if(resp==="SUBSCRIBED"){

await channel.track({
id:user.id,
status:"active",
page:pathname
})

}

})

channelRef.current = channel

}

initPresence()

return ()=>{

if(channelRef.current){
supabase.removeChannel(channelRef.current)
}

}

},[])

/* ---------------- UPDATE STATUS + PAGE ---------------- */

useEffect(()=>{

if(!channelRef.current || !userIdRef.current) return

channelRef.current.track({
id:userIdRef.current,
status,
page:pathname
})

},[status,pathname])

return(

<PresenceContext.Provider value={{presence}}>
{children}
</PresenceContext.Provider>

)

}

export function usePresence(){
return useContext(PresenceContext)
}
