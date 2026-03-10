"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id:string
  username:string
}

type UserDataType = {
  users:User[]
}

const UserDataContext = createContext<UserDataType>({
  users:[]
})

export function UserDataProvider({ children }:{children:React.ReactNode}){

  const [users,setUsers] = useState<User[]>(()=>{

    if(typeof window !== "undefined"){

      const cached = sessionStorage.getItem("users")

      if(cached){
        return JSON.parse(cached)
      }

    }

    return []

  })

  useEffect(()=>{

    async function load(){

      const res = await fetch("/api/admin/list-users")
      const data = await res.json()

      const list = data.users || []

      setUsers(list)

      sessionStorage.setItem(
        "users",
        JSON.stringify(list)
      )

    }

    load()

  },[])

  return(

    <UserDataContext.Provider value={{users}}>
      {children}
    </UserDataContext.Provider>

  )

}

export function useUserData(){
  return useContext(UserDataContext)
}