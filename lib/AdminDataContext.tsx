"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type AdminContextType = {
  users: any[]
  roles: any[]
  permissions: any[]
  userRoles: Record<string,string>
  currentRole: string
  load: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminDataProvider({ children }:{ children:React.ReactNode }){

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])
const [permissions,setPermissions] = useState<any[]>([])
const [userRoles,setUserRoles] = useState<Record<string,string>>({})
const [currentRole,setCurrentRole] = useState<string>("")

useEffect(()=>{

load()

const channel = supabase
.channel("admin-updates")
.on(
"postgres_changes",
{event:"*",schema:"public",table:"permissions"},
()=>load()
)
.on(
"postgres_changes",
{event:"*",schema:"public",table:"user_roles"},
()=>load()
)
.subscribe()

return () => {
supabase.removeChannel(channel)
}

},[])

async function load(){

const { data:userData } = await supabase.auth.getUser()

const userId = userData?.user?.id

const [
usersRes,
rolesRes,
permRes,
userRoleRes
] = await Promise.all([

supabase.from("profiles").select("id,username,disabled"),

supabase.from("roles").select("*"),

supabase.from("permissions").select("*"),

supabase.from("user_roles").select("*")

])

const usersData = usersRes.data || []
const rolesData = rolesRes.data || []
const permData = permRes.data || []
const userRoleData = userRoleRes.data || []

const map:Record<string,string> = {}

userRoleData.forEach((r:any)=>{
map[r.user_id] = r.role_id
})

setUsers(usersData)
setRoles(rolesData)
setPermissions(permData)
setUserRoles(map)

if(userId){
setCurrentRole(map[userId] ?? "")
}

}

return(

<AdminContext.Provider
value={{
users,
roles,
permissions,
userRoles,
currentRole,
load
}}
>

{children}

</AdminContext.Provider>

)

}

export function useAdminData(){

const ctx = useContext(AdminContext)

if(!ctx){
throw new Error("useAdminData must be used inside AdminDataProvider")
}

return ctx

}