"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserDataType{
users:any[]
refreshUsers:()=>Promise<void>
}

const UserDataContext = createContext<UserDataType>({
users:[],
refreshUsers: async ()=>{}
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

/* API loader */

async function refreshUsers(){

try{

const res = await fetch("/api/admin/list-users")

if(!res.ok) return

const data = await res.json()

const list = data.users || []

setUsers(list)

/* update cache */

localStorage.setItem(
"users-cache",
JSON.stringify(list)
)

}catch(e){

console.error("User load failed",e)

}

}

/* first load */

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