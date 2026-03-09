"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

const PresenceContext = createContext<any>({})

let channel:any = null

export function PresenceProvider({children}:{children:React.ReactNode}){

const pathname = usePathname()
const [presence,setPresence] = useState<any>({})

useEffect(()=>{

async function start(){

const { data } = await supabase.auth.getUser()
const user = data?.user
if(!user) return

/* prevent duplicate channels */

if(channel) return

channel = supabase.channel("online-users",{
config:{presence:{key:user.id}}
})

const update=()=>{
setPresence(channel.presenceState())
}

channel
.on("presence",{event:"sync"},update)
.on("presence",{event:"join"},update)
.on("presence",{event:"leave"},update)
.subscribe((status:any)=>{

if(status==="SUBSCRIBED"){

channel.track({
id:user.id,
page:pathname,
status:"active"
})

}

})

}

start()

},[])

/* update page instantly */

useEffect(()=>{

async function updatePage(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user || !channel) return

await channel.track({
id:user.id,
page:pathname,
status:"active"
})

}

updatePage()

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