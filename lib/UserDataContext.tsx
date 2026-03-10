"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  email?: string
  username?: string
  disabled?: boolean
}

type UserDataType = {
  users: User[]
  refreshUsers: () => Promise<void>
}

const UserDataContext = createContext<UserDataType>({
  users: [],
  refreshUsers: async () => {}
})

export function UserDataProvider({ children }:{ children:React.ReactNode }){

  const [users,setUsers] = useState<User[]>([])

  async function refreshUsers(){

    try{

      const res = await fetch("/api/admin/list-users")

      if(!res.ok) throw new Error("Failed to fetch users")

      const data = await res.json()

      setUsers(data.users || [])

    }catch(err){

      console.error("User load failed",err)

      setUsers([])

    }

  }

  useEffect(()=>{

    refreshUsers()

  },[])

  return(

    <UserDataContext.Provider value={{ users, refreshUsers }}>
      {children}
    </UserDataContext.Provider>

  )

}

export function useUserData(){
  return useContext(UserDataContext)
}