"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserDataType{
users:any[]
}

const UserDataContext = createContext<UserDataType>({
users:[]
})

export function UserDataProvider({
children
}:{children:React.ReactNode}){

const [users,setUsers] = useState<any[]>([])

/* load cached users instantly */

useEffect(()=>{

try{

const cached = localStorage.getItem("users-cache")

if(cached){
setUsers(JSON.parse(cached))
}

}catch{}

},[])

/* refresh users from API */

useEffect(()=>{

async function load(){

try{

const res = await fetch("/api/admin/list-users")

if(!res.ok) return

const data = await res.json()

const list = data.users || []

setUsers(list)

/* cache for instant reload */

localStorage.setItem(
"users-cache",
JSON.stringify(list)
)

}catch{}

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