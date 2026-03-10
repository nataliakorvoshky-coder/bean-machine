"use client"

import { useEffect, useState } from "react"

export default function RolesPage(){

const [roles,setRoles] = useState<any[]>([])
const [name,setName] = useState("")
const [selectedRole,setSelectedRole] = useState<any>(null)
const [permissions,setPermissions] = useState<any[]>([])

async function loadRoles(){

const res = await fetch("/api/admin/list-roles")
const data = await res.json()

setRoles(data.roles || [])

}

async function createRole(){

const res = await fetch("/api/admin/create-role",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ name })
})

setName("")
loadRoles()

}

async function loadPermissions(roleId:string){

setSelectedRole(roleId)

const res = await fetch("/api/admin/get-role-permissions",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ roleId })
})

const data = await res.json()

setPermissions(data.permissions || [])

}

async function updatePermission(page:string,type:string,value:boolean){

await fetch("/api/admin/update-permission",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
roleId:selectedRole,
page,
type,
value
})
})

loadPermissions(selectedRole)

}

useEffect(()=>{
loadRoles()
},[])

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<div className="flex gap-12">

{/* CREATE ROLE */}

<div className="w-[350px] bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-4 text-emerald-700">
Create Role
</h2>

<input
placeholder="Role name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-4"
/>

<button
onClick={createRole}
className="bg-emerald-500 text-white p-3 w-full rounded"
>
Create Role
</button>

</div>

{/* ROLE LIST */}

<div className="w-[350px] bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-4 text-emerald-700">
Roles
</h2>

<div className="space-y-2">

{roles.map(r=>(

<div
key={r.id}
onClick={()=>loadPermissions(r.id)}
className="border p-3 rounded cursor-pointer hover:bg-emerald-50"
>
{r.name}
</div>

))}

</div>

</div>

{/* PERMISSIONS */}

<div className="flex-1 bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-4 text-emerald-700">
Permissions
</h2>

<table className="w-full text-sm">

<thead>
<tr className="border-b">
<th className="text-left p-2">Page</th>
<th className="p-2">View</th>
<th className="p-2">Edit</th>
</tr>
</thead>

<tbody>

{permissions.map(p=>(
<tr key={p.page} className="border-b">

<td className="p-2">
{p.page}
</td>

<td className="text-center">

<input
type="checkbox"
checked={p.can_view}
onChange={(e)=>updatePermission(
p.page,
"view",
e.target.checked
)}
/>

</td>

<td className="text-center">

<input
type="checkbox"
checked={p.can_edit}
onChange={(e)=>updatePermission(
p.page,
"edit",
e.target.checked
)}
/>

</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

</div>

)

}