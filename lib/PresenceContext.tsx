"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type Connection = {
  id: string
  page?: string
}

const PresenceContext = createContext<Connection[]>([])

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [connections,setConnections] = useState<Connection[]>([])

  useEffect(()=>{

    let channel:any

    async function start(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if(!user) return

      channel = supabase.channel("online-users",{
        config:{ presence:{ key:user.id } }
      })

      const update = () => {

        const state = channel.presenceState()

        const flat:Connection[] = Object.values(state)
          .flat()
          .map((p:any)=>({
            id:p.id,
            page:p.page
          }))

        setConnections(flat)

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

    <PresenceContext.Provider value={connections}>
      {children}
    </PresenceContext.Provider>

  )

}

export function usePresence(){
  return useContext(PresenceContext)
}