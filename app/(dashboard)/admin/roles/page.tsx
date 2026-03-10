"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function RolesPage(){

usePermission("admin")

const [roles,setRoles] = useState<any[]>([])

/* LOAD ROLES + PERMISSIONS */

useEffect(()=>{

async function loadRoles(){

const { data } = await supabase
.from("roles")
.select(`
id,
name,
permissions(
id,
page,
can_view
)
`)
.order("name")

setRoles(data || [])

}

loadRoles()

},[])

/* TOGGLE PERMISSION */

async function togglePermission(permissionId:string,current:boolean){

await supabase
.from("permissions")
.update({
can_view:!current
})
.eq("id",permissionId)

/* refresh */

setRoles(r=>[...r])

}

/* ALL POSSIBLE PAGES */

const pages = [
"admin",
"dashboard",
"employees",
"settings"
]

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<div className="space-y-6">

{roles.map(role=>(

<div
key={role.id}
className="bg-white p-6 rounded-xl shadow"
>

<h2 className="text-lg font-semibold text-emerald-700 mb-4">
{role.name}
</h2>

<div className="space-y-2">

{pages.map(page=>{

const permission = role.permissions.find(
(p:any)=>p.page===page
)

return(

<div
key={page}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span className="capitalize">
{page}
</span>

<button
onClick={()=>togglePermission(
permission.id,
permission.can_view
)}
className={`px-3 py-1 rounded text-white ${
permission?.can_view
? "bg-emerald-600"
: "bg-gray-400"
}`}
>

{permission?.can_view
? "Enabled"
: "Disabled"}

</button>

</div>

)

})}

</div>

</div>

))}

</div>

</div>

)

}