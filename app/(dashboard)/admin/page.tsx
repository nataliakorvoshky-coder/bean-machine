"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function AdminPage(){

const ready = usePermission("admin")

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])

useEffect(()=>{

if(!ready) return

load()

},[ready])

async function load(){

const { data:usersData } = await supabase
.from("profiles")
.select("*")
.order("username")

const { data:rolesData } = await supabase
.from("roles")
.select("*")

setUsers(usersData || [])
setRoles(rolesData || [])

}

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({disabled:!user.disabled})
.eq("id",user.id)

load()

}

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

}

/* prevent render until permission check finishes */

if(!ready){
return null
}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold text-emerald-700 mb-6">
Current Users
</h2>

<div className="space-y-3">

{users.map(user=>(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span>{user.username}</span>

<div className="flex gap-3">

<select
defaultValue=""
onChange={(e)=>changeRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-2"
>

<option value="">Role</option>

{roles.map(role=>(
<option key={role.id} value={role.id}>
{role.name}
</option>
))}

</select>

<button
onClick={()=>toggleUser(user)}
className={`px-3 py-1 rounded text-white ${
user.disabled
? "bg-gray-500"
: "bg-emerald-600"
}`}
>

{user.disabled ? "Enable" : "Disable"}

</button>

</div>

</div>

))}

</div>

</div>

</div>

)

}