"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type PresenceState = Record<string, any>

const PresenceContext = createContext<{presence:PresenceState}>({
  presence:{}
})

let channel:any = null
let currentPresence:PresenceState = {}

export function PresenceProvider({children}:{children:React.ReactNode}){

  const pathname = usePathname()
  const [presence,setPresence] = useState<PresenceState>({})

  useEffect(()=>{

    async function init(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if(!user) return

      if(!channel){

        channel = supabase.channel("online-users",{
          config:{ presence:{ key:user.id } }
        })

        channel
          .on("presence",{event:"sync"},()=>{

            currentPresence = channel.presenceState()
            setPresence({...currentPresence})

          })
          .on("presence",{event:"join"},()=>{

            currentPresence = channel.presenceState()
            setPresence({...currentPresence})

          })
          .on("presence",{event:"leave"},()=>{

            currentPresence = channel.presenceState()
            setPresence({...currentPresence})

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

      /* Immediately track on navigation */

      await channel.track({
        id:user.id,
        page:pathname,
        online_at:new Date().toISOString()
      })

    }

    init()

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