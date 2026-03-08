"use client"

import { createContext, useContext, useState } from "react"

type UserContextType = {
 username: string
 setUsername: (name:string)=>void
 loading: boolean
 setLoading: (value:boolean)=>void
}

const UserContext = createContext<UserContextType>({
 username:"",
 setUsername:()=>{},
 loading:true,
 setLoading:()=>{}
})

export function UserProvider({children}:{children:React.ReactNode}){

 const cachedUsername =
  typeof window !== "undefined"
   ? localStorage.getItem("username") || ""
   : ""

 const [username,setUsernameState] = useState(cachedUsername)
 const [loading,setLoading] = useState(!cachedUsername)



 function setUsername(name:string){

  localStorage.setItem("username",name)
  setUsernameState(name)

 }

 return(
  <UserContext.Provider value={{
   username,
   setUsername,
   loading,
   setLoading
  }}>
   {children}
  </UserContext.Provider>
 )

}

export function useUser(){
 return useContext(UserContext)
}