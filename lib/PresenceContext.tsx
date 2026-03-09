"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any>

interface PresenceContextType {
  presence: PresenceState
}

const PresenceContext = createContext<PresenceContextType>({
  presence: {}
})

let channel:any = null
let heartbeat:any = null

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [presence,setPresence] = useState<PresenceState>({})

  useEffect(()=>{

    async function init(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if(!user) return

      if(!channel){

        channel = supabase.channel("online-users",{
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
          .subscribe(async(status:string)=>{

            if(status==="SUBSCRIBED"){

              await channel.track({
                id:user.id,
                page:pathname,
                online_at:new Date().toISOString()
              })

            }

          })

      }

      /* heartbeat prevents ghost offline */

      if(!heartbeat){

        heartbeat = setInterval(async()=>{

          if(!channel) return

          await channel.track({
            id:user.id,
            page:pathname,
            online_at:new Date().toISOString()
          })

        },10000)

      }

      /* detect tab close instantly */

      window.addEventListener("beforeunload",async()=>{

        if(channel){

          await channel.untrack()

        }

      })

    }

    init()

  },[])

  /* instant update when navigating */

  useEffect(()=>{

    async function update(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user || !channel) return

      await channel.track({
        id:user.id,
        page:pathname,
        online_at:new Date().toISOString()
      })

    }

    update()

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