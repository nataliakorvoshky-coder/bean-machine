"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface UserDataType {
users: any[]
refreshUsers: () => Promise<void>
}

const UserDataContext = createContext<UserDataType>({
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

console.error("Failed to load users")

}

}

useEffect(()=>{

refreshUsers()

/* REALTIME SUBSCRIPTION */

const channel = supabase
.channel("users-live")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"profiles"
},
() => {

refreshUsers()

}
)
.subscribe()

return ()=>{

supabase.removeChannel(channel)

}

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
