"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function RolesPage(){

const { users, roles, permissions, userRoles, load } = useAdminData()

/* pages available for permissions */

const pages = [
"admin",
"dashboard",
"employees",
"submit-hours",
"inventory",
"restock",
"profile",
"settings"
]

/* permission state */

const [permUpdates,setPermUpdates] = useState<Record<string,boolean>>({})

/* toggle checkbox */

function toggle(roleId:string,page:string){

const key = `${roleId}_${page}`

setPermUpdates(prev=>({

...prev,
[key]:!prev[key]

}))

}

/* assign role to user */

async function assignRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

load()

}

/* save permissions */

async function applyChanges(){

for(const key in permUpdates){

const [roleId,page] = key.split("_")

const allowed = permUpdates[key]

if(allowed){

await supabase
.from("role_permissions")
.upsert({
role_id:roleId,
page
})

}else{

await supabase
.from("role_permissions")
.delete()
.eq("role_id",roleId)
.eq("page",page)

}

}

setPermUpdates({})

load()

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

{/* PERMISSION TABLE */}

<div className="bg-white p-8 rounded-xl shadow">

<table className="w-full text-left">

<thead>

<tr className="border-b border-emerald-300">

<th className="pb-4 text-emerald-700">
Role
</th>

{pages.map(page=>(
<th key={page} className="pb-4 text-emerald-700 capitalize">
{page}
</th>
))}

</tr>

</thead>

<tbody>

{roles.map((role:any)=>(

<tr
key={role.id}
className="border-b border-emerald-300"
>

<td className="py-4 font-medium text-emerald-700">
{role.name}
</td>

{pages.map(page=>{

const key = `${role.id}_${page}`

/* check if permission exists */

const exists = permissions.find(
(p:any)=>
p.role_id === role.id &&
p.page === page
)

const checked =
permUpdates[key] !== undefined
? permUpdates[key]
: !!exists

/* admin forced access */

const disabled =
role.name === "admin"

return(

<td key={page} className="py-4">

<input
type="checkbox"
checked={checked || disabled}
disabled={disabled}
onChange={()=>toggle(role.id,page)}
className="w-5 h-5 border-emerald-400 accent-emerald-600"
/>

</td>

)

})}

</tr>

))}

</tbody>

</table>

</div>

{/* ASSIGN ROLES */}

<div className="bg-white p-8 rounded-xl shadow mt-8">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Assign Roles to Users
</h2>

<div className="space-y-3">

{users.map((user:any)=>{

const roleId = userRoles[user.id] || ""

return(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span className="text-emerald-700">
{user.username}
</span>

<select
value={roleId}
onChange={(e)=>assignRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-3 py-1"
>

<option value="">
No Role
</option>

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

<button
onClick={applyChanges}
className="mt-8 bg-emerald-600 text-white px-6 py-2 rounded"
>

Apply Changes

</button>

</div>

)

}