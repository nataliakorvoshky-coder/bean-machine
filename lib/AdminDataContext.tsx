"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

const AdminContext = createContext<any>(null)

export function AdminDataProvider({children}:{children:React.ReactNode}){

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])
const [permissions,setPermissions] = useState<any[]>([])
const [userRoles,setUserRoles] = useState<any>({})
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

return ()=>{

supabase.removeChannel(channel)

}

},[])

async function load(){

const { data:userData } = await supabase.auth.getUser()

const userId = userData?.user?.id

const { data:usersData } = await supabase
.from("profiles")
.select("id,username,disabled")

const { data:rolesData } = await supabase
.from("roles")
.select("*")

const { data:permData } = await supabase
.from("permissions")
.select("*")

const { data:userRoleData } = await supabase
.from("user_roles")
.select("*")

const map:any = {}

userRoleData?.forEach((r:any)=>{
map[r.user_id] = r.role_id
})

setUsers(usersData || [])
setRoles(rolesData || [])
setPermissions(permData || [])
setUserRoles(map)

if(userId){
setCurrentRole(map[userId] || "")
}

}

function canAccess(page:string){

if(!currentRole) return false

const perm = permissions.find(
(p:any)=>p.role_id===currentRole && p.page===page
)

return perm?.can_view || false

}

return(

<AdminContext.Provider value={{
users,
roles,
permissions,
userRoles,
canAccess,
load
}}>

{children}

</AdminContext.Provider>

)

}

export function useAdminData(){
return useContext(AdminContext)
}