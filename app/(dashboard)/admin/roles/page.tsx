"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function RolesPage(){

const { users, roles, permissions, userRoles, load } = useAdminData()

const pages = ["admin","dashboard","employees","inventory","settings"]

const [roleUpdates,setRoleUpdates] = useState<Record<string,string>>({})

const [permUpdates,setPermUpdates] = useState<Record<string,boolean>>({})

/* assign role selection */

function setUserRole(userId:string,roleId:string){

setRoleUpdates(prev=>({
...prev,
[userId]:roleId
}))

}

/* toggle permission */

function togglePerm(roleId:string,page:string){

const key = `${roleId}_${page}`

setPermUpdates((prev:Record<string,boolean>)=>({
...prev,
[key]:!prev[key]
}))

}

/* submit changes */

async function submitChanges(){

/* update user roles */

for(const userId in roleUpdates){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleUpdates[userId]
})

}

/* update permissions */

for(const key in permUpdates){

const [roleId,page] = key.split("_")

await supabase
.from("permissions")
.upsert({
role_id:roleId,
page,
can_view:permUpdates[key]
})

}

setRoleUpdates({})
setPermUpdates({})

await load()

}

return(

<div className="w-[1200px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

{/* ROLE PERMISSION GRID */}

<div className="bg-white rounded-xl shadow p-8 mb-10">

<table className="w-full">

<thead>

<tr className="border-b border-emerald-300 text-emerald-700">

<th className="text-left py-2">Role</th>

{pages.map(page=>(

<th key={page} className="text-center capitalize">
{page}
</th>

))}

</tr>

</thead>

<tbody>

{roles.map((role:any)=>{

return(

<tr key={role.id} className="border-b">

<td className="py-3 font-medium text-emerald-700 capitalize">
{role.name}
</td>

{pages.map(page=>{

const perm = permissions.find(
(p:any)=>p.role_id===role.id && p.page===page
)

const checked = perm?.can_view || false

const key = `${role.id}_${page}`

return(

<td key={page} className="text-center">

<input
type="checkbox"
checked={permUpdates[key] ?? checked}
onChange={()=>togglePerm(role.id,page)}
className="w-5 h-5 accent-emerald-600 cursor-pointer"
/>

</td>

)

})}

</tr>

)

})}

</tbody>

</table>

</div>

{/* ASSIGN ROLES TO USERS */}

<div className="bg-white rounded-xl shadow p-8 mb-10">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Assign Roles to Users
</h2>

<div className="space-y-3">

{users.map((user:any)=>{

return(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span className="text-emerald-700 font-medium">
{user.username}
</span>

<select
value={roleUpdates[user.id] ?? userRoles[user.id] ?? ""}
onChange={(e)=>setUserRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-3 py-1"
>

<option value="">No Role</option>

{roles.map((role:any)=>(

<option key={role.id} value={role.id}>
{role.name}
</option>

))}

</select>

</div>

)

})}

</div>

</div>

{/* SUBMIT BUTTON */}

<button
onClick={submitChanges}
className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
>
Apply Changes
</button>

</div>

)

}