"use client"

import { createContext, useContext, useEffect, useState } from "react"

const UserDataContext = createContext<any>({
  users: [],
  refreshUsers: async () => {}
})

export function UserDataProvider({ children }: { children: React.ReactNode }) {

  const [users,setUsers] = useState<any[]>([])

  async function refreshUsers(){

    try{

      const res = await fetch("/api/admin/list-users")

      const data = await res.json()

      setUsers(data.users || [])

    }catch(err){

      console.error("User load error")

      setUsers([])

    }

  }

  useEffect(()=>{

    refreshUsers()

  },[])

  return(

  <UserDataContext.Provider value={{users,refreshUsers}}>
    {children}
  </UserDataContext.Provider>

  )

}

export function useUserData(){
  return useContext(UserDataContext)
}