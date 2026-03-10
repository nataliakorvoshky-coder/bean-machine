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
refreshUsers: async()=>{}
})

export function UserDataProvider({
children
}:{children:React.ReactNode}){

const [users,setUsers] = useState<User[]>(()=>{

if(typeof window !== "undefined"){

const stored = sessionStorage.getItem("users")

if(stored){
return JSON.parse(stored)
}

}

return []

})

async function refreshUsers(){

try{

const res = await fetch("/api/admin/list-users")

const data = await res.json()

setUsers(data.users || [])

sessionStorage.setItem(
"users",
JSON.stringify(data.users || [])
)

}catch(err){

console.error("Failed loading users",err)

}

}

useEffect(()=>{

refreshUsers()

},[])

return(

<UserDataContext.Provider
value={{ users, refreshUsers }}
>

{children}

</UserDataContext.Provider>

)

}

export function useUserData(){
return useContext(UserDataContext)
}