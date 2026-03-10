"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

type Connection = {
  id: string
  page?: string
}

const PresenceContext = createContext<Connection[]>([])

let channel:any = null

export function PresenceProvider({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  const [connections,setConnections] = useState<Connection[]>(() => {

    if(typeof window !== "undefined"){
      const cached = sessionStorage.getItem("presence")
      if(cached) return JSON.parse(cached)
    }

    return []

  })

  function isSame(a:Connection[],b:Connection[]){

    if(a.length !== b.length) return false

    const map = new Map(a.map(x => [x.id,x.page]))

    for(const item of b){
      if(map.get(item.id) !== item.page) return false
    }

    return true

  }

  useEffect(()=>{

    async function start(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if(!user) return

      if(channel) return

      channel = supabase.channel("online-users",{
        config:{ presence:{ key:user.id } }
      })

      const update = () => {

        const state = channel.presenceState()

        const flat:Connection[] = Object.values(state || {})
          .flat()
          .map((p:any)=>({
            id:p.id,
            page:p.page
          }))

        const unique = Array.from(
          new Map(flat.map(c=>[c.id,c])).values()
        )

        setConnections(prev => {

          if(isSame(prev,unique)){
            return prev
          }

          sessionStorage.setItem(
            "presence",
            JSON.stringify(unique)
          )

          return unique

        })

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

  },[])

  useEffect(()=>{

    async function updatePage(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user || !channel) return

      await channel.track({
        id:user.id,
        page:pathname
      })

    }

    updatePage()

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