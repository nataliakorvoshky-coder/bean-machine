"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const UserContext = createContext<any>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [username,setUsername] = useState("")

  useEffect(()=>{

    async function load(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user) return

      const { data:profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id",user.id)
        .single()

      if(profile?.username){
        setUsername(profile.username)
      }

    }

    load()

  },[])

  return(

  <UserContext.Provider value={{username,setUsername}}>
    {children}
  </UserContext.Provider>

  )

}

export function useUser(){
  return useContext(UserContext)
}