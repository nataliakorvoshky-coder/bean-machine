"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const AdminDataContext = createContext<any>(null)

export function AdminDataProvider({ children }:{children:React.ReactNode}){

const [users,setUsers] = useState<any[]>(()=>{
if(typeof window !== "undefined"){
const stored = sessionStorage.getItem("admin_users")
return stored ? JSON.parse(stored) : []
}
return []
})

const [roles,setRoles] = useState<any[]>(()=>{
if(typeof window !== "undefined"){
const stored = sessionStorage.getItem("admin_roles")
return stored ? JSON.parse(stored) : []
}
return []
})

const [userRoles,setUserRoles] = useState<any>(()=>{
if(typeof window !== "undefined"){
const stored = sessionStorage.getItem("admin_user_roles")
return stored ? JSON.parse(stored) : {}
}
return {}
})

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

/* persist */

sessionStorage.setItem("admin_users",JSON.stringify(usersData || []))
sessionStorage.setItem("admin_roles",JSON.stringify(rolesData || []))
sessionStorage.setItem("admin_user_roles",JSON.stringify(roleMap))

}

function updateUser(user:any){

const updated = users.map((u:any)=>
u.id === user.id ? user : u
)

setUsers(updated)
sessionStorage.setItem("admin_users",JSON.stringify(updated))

}

function updateRole(userId:string,roleId:string){

const updated = {
...userRoles,
[userId]:roleId
}

setUserRoles(updated)
sessionStorage.setItem("admin_user_roles",JSON.stringify(updated))

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