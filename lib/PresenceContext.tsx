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

let channel: any = null
let cachedPresence: PresenceState = {}

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const [presence,setPresence] = useState<PresenceState>(cachedPresence)

  useEffect(()=>{

    async function start(){

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

            cachedPresence = channel.presenceState()
            setPresence({...cachedPresence})

          })
          .on("presence",{event:"join"},()=>{

            cachedPresence = channel.presenceState()
            setPresence({...cachedPresence})

          })
          .on("presence",{event:"leave"},()=>{

            cachedPresence = channel.presenceState()
            setPresence({...cachedPresence})

          })
          .subscribe(async(status:string)=>{

            if(status==="SUBSCRIBED"){

              await channel.track({
                id:user.id,
                page:pathname,
                online_at:new Date().toISOString()
              })

              /* force instant sync */

              cachedPresence = channel.presenceState()
              setPresence({...cachedPresence})

            }

          })

      }

      /* immediate update on navigation */

      await channel.track({
        id:user.id,
        page:pathname,
        online_at:new Date().toISOString()
      })

      cachedPresence = channel.presenceState()
      setPresence({...cachedPresence})

    }

    start()

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