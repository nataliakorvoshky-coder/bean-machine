"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type Connection = {
  id:string
  page?:string
  status:string
}

const PresenceContext = createContext<Connection[]>([])

let channel:any = null

export function PresenceProvider({ children }:{children:React.ReactNode}){

  const pathname = usePathname()

  const [connections,setConnections] = useState<Connection[]>(()=>{

    if(typeof window !== "undefined"){
      const cached = sessionStorage.getItem("presence")
      if(cached) return JSON.parse(cached)
    }

    return []

  })

  const [status,setStatus] = useState("active")

  /* IDLE TRACKING */

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

  /* START PRESENCE */

  useEffect(()=>{

    async function start(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user) return

      if(channel) return

      channel = supabase.channel("online-users",{
        config:{ presence:{ key:user.id } }
      })

      const update = ()=>{

        const state = channel.presenceState()

        const flat = Object.values(state || {})
          .flat()
          .map((p:any)=>({
            id:p.id,
            page:p.page,
            status:p.status
          }))

        const unique = Array.from(
          new Map(flat.map((c:any)=>[c.id,c])).values()
        )

        if(unique.length===0) return

        setConnections(unique)

        sessionStorage.setItem(
          "presence",
          JSON.stringify(unique)
        )

      }

      channel
      .on("presence",{event:"sync"},update)
      .on("presence",{event:"join"},update)
      .on("presence",{event:"leave"},update)
      .subscribe(async(resp:string)=>{

        if(resp==="SUBSCRIBED"){

          await channel.track({
            id:user.id,
            page:pathname,
            status
          })

        }

      })

    }

    start()

  },[])

  /* UPDATE LOCATION + STATUS */

  useEffect(()=>{

    async function update(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user || !channel) return

      await channel.track({
        id:user.id,
        page:pathname,
        status
      })

    }

    update()

  },[pathname,status])

  return(

    <PresenceContext.Provider value={connections}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence(){
  return useContext(PresenceContext)
}