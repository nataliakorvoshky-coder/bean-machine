"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"

type ContextType = {
  users:any[]
  roles:any[]
  permissions:any[]
  userRoles:Record<string,string>
  username:string
  load:()=>Promise<void>
}

const AdminContext = createContext<ContextType | null>(null)

export function AdminDataProvider({children}:{children:React.ReactNode}){

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])
const [permissions,setPermissions] = useState<any[]>([])
const [userRoles,setUserRoles] = useState<Record<string,string>>({})
const [username,setUsername] = useState("")

async function load(){

const { data:profiles } = await supabase
.from("profiles")
.select("*")

setUsers(profiles || [])

const { data:rolesData } = await supabase
.from("roles")
.select("*")

setRoles(rolesData || [])

const { data:permData } = await supabase
.from("role_permissions")
.select("*")

setPermissions(permData || [])

const { data:userRoleData } = await supabase
.from("user_roles")
.select("*")

const map:Record<string,string> = {}

userRoleData?.forEach((r:any)=>{
map[r.user_id] = r.role_id
})

setUserRoles(map)

/* username */

const { data } = await supabase.auth.getUser()

const user = data?.user

if(user){

const { data:profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.single()

if(profile?.username){

setUsername(profile.username)

if(typeof window !== "undefined"){
sessionStorage.setItem("username",profile.username)
}

}

}

}

/* realtime listeners */

useEffect(()=>{

load()

/* profiles */

const profilesChannel = supabase
.channel("profiles-live")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"profiles"
},
payload=>{

const newRow:any = payload.new

setUsers(prev=>{

const list = [...prev]

const index = list.findIndex(
u => u.id === newRow?.id
)

if(index > -1){

list[index] = newRow

}else{

list.push(newRow)

}

return list

})

}
)
.subscribe()

/* roles */

const rolesChannel = supabase
.channel("userroles-live")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"user_roles"
},
payload=>{

const newRow:any = payload.new

setUserRoles(prev=>({

...prev,
[newRow.user_id]: newRow.role_id

}))

}
)
.subscribe()

/* permissions */

const permChannel = supabase
.channel("permissions-live")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"role_permissions"
},
payload=>{

const newRow:any = payload.new

setPermissions(prev=>{

const list = [...prev]

const index = list.findIndex(
p =>
p.role_id === newRow.role_id &&
p.page === newRow.page
)

if(index > -1){

list[index] = newRow

}else{

list.push(newRow)

}

return list

})

}
)
.subscribe()

return ()=>{

supabase.removeChannel(profilesChannel)
supabase.removeChannel(rolesChannel)
supabase.removeChannel(permChannel)

}

},[])

return(

<AdminContext.Provider
value={{
users,
roles,
permissions,
userRoles,
username,
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