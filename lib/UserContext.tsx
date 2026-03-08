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

 const [username,setUsername] = useState("")
 const [loading,setLoading] = useState(true)

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