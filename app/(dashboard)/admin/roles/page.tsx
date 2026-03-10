"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RolesPage(){

const [roles,setRoles] = useState<any[]>([])
const [permissions,setPermissions] = useState<any[]>([])
const [users,setUsers] = useState<any[]>([])
const [userRoles,setUserRoles] = useState<any>({})

const pages = ["admin","dashboard","employees","settings"]

useEffect(()=>{
load()
},[])

async function load(){

const { data:rolesData } = await supabase
.from("roles")
.select("*")
.order("name")

const { data:permData } = await supabase
.from("permissions")
.select("*")

const { data:userData } = await supabase
.from("profiles")
.select("id,username")

const { data:userRoleData } = await supabase
.from("user_roles")
.select("*")

const map:any = {}

userRoleData?.forEach((r:any)=>{
map[r.user_id] = r.role_id
})

setRoles(rolesData || [])
setPermissions(permData || [])
setUsers(userData || [])
setUserRoles(map)

}

/* toggle permission */

async function toggle(roleId:string,page:string,current:boolean){

await supabase
.from("permissions")
.update({can_view:!current})
.eq("role_id",roleId)
.eq("page",page)

load()

}

/* assign role */

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

setUserRoles({
...userRoles,
[userId]:roleId
})

}

return(

<div className="w-[1100px] space-y-10">

<h1 className="text-3xl font-bold text-emerald-700">
Roles & Permissions
</h1>

{/* USER ROLE ASSIGNMENT */}

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Assign Roles
</h2>

<div className="space-y-3">

{users.map(user=>(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span>{user.username}</span>

<select
value={userRoles[user.id] || ""}
onChange={(e)=>changeRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-2 py-1"
>

<option value="">Select Role</option>

{roles.map(role=>(
<option key={role.id} value={role.id}>
{role.name}
</option>
))}

</select>

</div>

))}

</div>

</div>

{/* PERMISSIONS */}

{roles.map(role=>(

<div
key={role.id}
className="bg-white p-8 rounded-xl shadow"
>

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
{role.name}
</h2>

<div className="space-y-2">

{pages.map(page=>{

const perm = permissions.find(
(p:any)=>p.role_id===role.id && p.page===page
)

const enabled = perm?.can_view ?? false

return(

<div
key={page}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span className="capitalize">
{page}
</span>

<button
onClick={()=>toggle(role.id,page,enabled)}
className={`px-3 py-1 rounded text-white ${
enabled
? "bg-emerald-600"
: "bg-gray-400"
}`}
>

{enabled ? "Enabled" : "Disabled"}

</button>

</div>

)

})}

</div>

</div>

))}

</div>

)

}