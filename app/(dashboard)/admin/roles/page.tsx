"use client"

export const dynamic = "force-dynamic"

import { useAdminData } from "@/lib/AdminDataContext"
import { supabase } from "@/lib/supabase"

export default function RolesPage(){

const { users, roles, permissions, userRoles, load } = useAdminData()

const pages = ["admin","dashboard","employees","inventory","settings"]

function enabled(roleId:string,page:string){

const perm = permissions.find(
(p:any)=>p.role_id===roleId && p.page===page
)

return perm?.can_view || false

}

async function toggle(roleId:string,page:string,current:boolean){

await supabase
.from("permissions")
.upsert({
role_id:roleId,
page,
can_view:!current
})

load()

}

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

load()

}

return(

<div className="w-[1100px] space-y-8">

<h1 className="text-3xl font-bold text-emerald-700">
Roles & Permissions
</h1>

{/* USER ROLE ASSIGNMENT */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-4">
Assign Roles
</h2>

<div className="space-y-3">

{users.map((user:any)=>(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 rounded-lg p-3"
>

<span className="font-medium">
{user.username}
</span>

<select
value={userRoles[user.id] || ""}
onChange={(e)=>changeRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-3 py-1"
>

<option value="">No Role</option>

{roles.map((role:any)=>{

const name =
role.name.charAt(0).toUpperCase() + role.name.slice(1)

return(

<option key={role.id} value={role.id}>
{name}
</option>

)

})}

</select>

</div>

))}

</div>

</div>

{/* PERMISSION MATRIX */}

<div className="bg-white rounded-xl shadow overflow-hidden">

<table className="w-full text-center">

<thead>

<tr className="border-b border-emerald-300 text-emerald-700">

<th className="p-4 text-left">
Role
</th>

{pages.map(page=>(
<th key={page} className="capitalize">
{page}
</th>
))}

</tr>

</thead>

<tbody>

{roles.map((role:any)=>{

const roleName =
role.name.charAt(0).toUpperCase() + role.name.slice(1)

return(

<tr key={role.id} className="border-b">

<td className="p-4 text-left font-semibold text-emerald-700">
{roleName}
</td>

{pages.map(page=>{

const isOn = enabled(role.id,page)

return(

<td key={page}>

<input
type="checkbox"
checked={isOn}
onChange={()=>toggle(role.id,page,isOn)}
className="w-5 h-5 cursor-pointer accent-red-500 checked:accent-emerald-600"
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

</div>

)

}