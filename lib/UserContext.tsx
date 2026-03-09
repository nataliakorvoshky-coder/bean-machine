"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface UserContextType {
 username: string
 setUsername: (name:string)=>void
}

const UserContext = createContext<UserContextType>({
 username:"",
 setUsername:()=>{}
})

export function UserProvider({children}:{children:React.ReactNode}){

 const [username,setUsername] = useState("")

 useEffect(()=>{

  async function loadProfile(){

   const { data } = await supabase.auth.getUser()
   const user = data.user

   if(!user) return

   const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

   if(profile?.username){
    setUsername(profile.username)
   }else{
    setUsername("User")
   }

  }

  loadProfile()

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