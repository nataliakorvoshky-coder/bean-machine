"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

const PresenceContext = createContext<any>(null)

export function PresenceProvider({children}:{children:React.ReactNode}){

const pathname = usePathname()

const [presence,setPresence] = useState<any>({})

const channelRef = useRef<any>(null)
const userIdRef = useRef<string | null>(null)

useEffect(()=>{

async function startPresence(){

const { data } = await supabase.auth.getUser()
const user = data.user

if(!user) return

userIdRef.current = user.id

const channel = supabase.channel("online-users",{
config:{ presence:{ key:user.id } }
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
.subscribe(async(status)=>{

if(status==="SUBSCRIBED"){

await channel.track({
id:user.id,
status:"active",
page:pathname
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

useEffect(()=>{

if(!channelRef.current || !userIdRef.current) return

channelRef.current.track({
id:userIdRef.current,
status:"active",
page:pathname
})

},[pathname])

return(

<PresenceContext.Provider value={{presence}}>
{children}
</PresenceContext.Provider>

)

}

export function usePresence(){
return useContext(PresenceContext)
}
