"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserDataType{
 users:any[]
 setUsers:(u:any[])=>void
 refreshUsers:()=>Promise<void>
}

const UserDataContext = createContext<UserDataType>({
 users:[],
 setUsers:()=>{},
 refreshUsers:async()=>{}
})

export function UserDataProvider({children}:{children:React.ReactNode}){

 const [users,setUsers] = useState<any[]>([])

 async function refreshUsers(){

  const res = await fetch("/api/admin/list-users")
  const data = await res.json()

  setUsers(data.users || [])

 }

 useEffect(()=>{
  refreshUsers()
 },[])

 return(
  <UserDataContext.Provider value={{users,setUsers,refreshUsers}}>
   {children}
  </UserDataContext.Provider>
 )

}

export function useUserData(){
 return useContext(UserDataContext)
}