"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function AdminPage(){

usePermission("admin")

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])

async function load(){

const { data:rolesData } = await supabase
.from("roles")
.select("*")

setRoles(rolesData || [])

const { data } = await supabase
.from("profiles")
.select(`
id,
username,
user_roles (
role_id,
roles (
id,
name
)
)
`)

setUsers(data || [])

}

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.update({ role_id:roleId })
.eq("user_id",userId)

load()

}

useEffect(()=>{

load()

},[])

return(

<div className="w-[900px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
User Roles
</h1>

<div className="bg-white p-8 rounded-xl shadow space-y-4">

{users.map((u)=>{

const currentRole = u.user_roles?.roles?.name

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username || "New User"}
</span>

<select
value={u.user_roles?.role_id}
onChange={(e)=>changeRole(u.id,e.target.value)}
className="border border-emerald-400 rounded px-2 py-1"
>

{roles.map((r)=>(
<option key={r.id} value={r.id}>
{r.name}
</option>
))}

</select>

</div>

)

})}

</div>

</div>

)

}