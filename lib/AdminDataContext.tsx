"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const AdminDataContext = createContext<any>(null)

export function AdminDataProvider({ children }: { children: React.ReactNode }){

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])
const [userRoles,setUserRoles] = useState<any>({})

useEffect(()=>{
load()
},[])

async function load(){

const { data:usersData } = await supabase
.from("profiles")
.select("id,username,disabled")
.order("username")

const { data:rolesData } = await supabase
.from("roles")
.select("*")
.order("name")

const { data:userRoleData } = await supabase
.from("user_roles")
.select("*")

const roleMap:any = {}

userRoleData?.forEach((r:any)=>{
roleMap[r.user_id] = r.role_id
})

setUsers(usersData || [])
setRoles(rolesData || [])
setUserRoles(roleMap)

}

function updateUser(user:any){

setUsers(users.map((u:any)=>
u.id === user.id ? user : u
))

}

function updateRole(userId:string,roleId:string){

setUserRoles({
...userRoles,
[userId]:roleId
})

}

return(

<AdminDataContext.Provider value={{
users,
roles,
userRoles,
updateUser,
updateRole,
reload:load
}}>

{children}

</AdminDataContext.Provider>

)

}

export function useAdminData(){
return useContext(AdminDataContext)
}