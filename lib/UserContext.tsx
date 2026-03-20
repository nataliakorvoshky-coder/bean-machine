"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const UserContext = createContext<any>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [username,setUsername] = useState<string>("")

  useEffect(()=>{

    async function loadUser(){

      const cached = localStorage.getItem("username")

      if(cached){
        setUsername(cached)
      }

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user) return

      const { data:profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id",user.id)
      .maybeSingle()

      if(profile?.username){

        setUsername(profile.username)

        localStorage.setItem(
          "username",
          profile.username
        )

      }

    }

    loadUser()

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