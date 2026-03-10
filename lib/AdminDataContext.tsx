"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

type AdminContextType={
users:any[]
roles:any[]
permissions:any[]
userRoles:Record<string,string>
currentRole:string
load:()=>Promise<void>
canAccess:(page:string)=>boolean
}

const AdminContext=createContext<AdminContextType|null>(null)

export function AdminDataProvider({children}:{children:React.ReactNode}){

const [users,setUsers]=useState<any[]>([])
const [roles,setRoles]=useState<any[]>([])
const [permissions,setPermissions]=useState<any[]>([])
const [userRoles,setUserRoles]=useState<Record<string,string>>({})
const [currentRole,setCurrentRole]=useState<string>("")

async function load(){

const { data:userData }=await supabase.auth.getUser()

const userId=userData?.user?.id

const [usersRes,rolesRes,permRes,userRoleRes]=await Promise.all([

supabase.from("profiles").select("id,username,disabled"),

supabase.from("roles").select("*"),

supabase.from("permissions").select("*"),

supabase.from("user_roles").select("*")

])

const map:Record<string,string>={}

userRoleRes.data?.forEach((r:any)=>{
map[r.user_id]=r.role_id
})

setUsers(usersRes.data||[])
setRoles(rolesRes.data||[])
setPermissions(permRes.data||[])
setUserRoles(map)

if(userId){
setCurrentRole(map[userId]||"")
}

}

useEffect(()=>{

load()

/* realtime updates */

const channel=supabase
.channel("admin-live")
.on("postgres_changes",
{event:"*",schema:"public",table:"permissions"},
()=>load()
)
.on("postgres_changes",
{event:"*",schema:"public",table:"user_roles"},
()=>load()
)
.on("postgres_changes",
{event:"*",schema:"public",table:"roles"},
()=>load()
)
.subscribe()

return()=>{
supabase.removeChannel(channel)
}

},[])

function canAccess(page:string){

if(!currentRole) return true

const role=roles.find(r=>r.id===currentRole)

if(!role) return false

/* inheritance */

const allowedRoles=roles
.filter(r=>r.level<=role.level)
.map(r=>r.id)

const perm=permissions.find(p=>

allowedRoles.includes(p.role_id) &&
p.page===page &&
p.can_view
)

return !!perm

}

return(

<AdminContext.Provider value={{
users,
roles,
permissions,
userRoles,
currentRole,
load,
canAccess
}}>

{children}

</AdminContext.Provider>

)

}

export function useAdminData(){

const ctx=useContext(AdminContext)

if(!ctx){
throw new Error("useAdminData must be used inside AdminDataProvider")
}

return ctx

}