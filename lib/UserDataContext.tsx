"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
}

interface UserDataType {
  users: User[]
  refreshUsers: () => Promise<void>
}

const UserDataContext = createContext<UserDataType>({
  users: [],
  refreshUsers: async () => {}
})

export function UserDataProvider({
  children
}: {
  children: React.ReactNode
}) {

  const [users,setUsers] = useState<User[]>([])

  async function refreshUsers(){

    try{

      const res = await fetch("/api/admin/list-users")

      const data = await res.json()

      if(data?.users){
        setUsers(data.users)
      }

    }catch(err){
      console.error("User load failed")
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