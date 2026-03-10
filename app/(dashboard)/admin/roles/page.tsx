"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function RolesPage(){

const ready = usePermission("admin")

const [roles,setRoles] = useState<any[]>([])
const [permissions,setPermissions] = useState<any[]>([])

const pages = ["admin","dashboard","employees","settings"]

useEffect(()=>{

if(!ready) return

load()

},[ready])

async function load(){

const { data:rolesData } = await supabase
.from("roles")
.select("*")
.order("name")

const { data:permData } = await supabase
.from("permissions")
.select("*")

setRoles(rolesData || [])
setPermissions(permData || [])

}

async function toggle(roleId:string,page:string,current:boolean){

const existing = permissions.find(
(p:any)=>p.role_id===roleId && p.page===page
)

/* update if exists */

if(existing){

await supabase
.from("permissions")
.update({can_view:!current})
.eq("role_id",roleId)
.eq("page",page)

setPermissions(prev =>
prev.map(p =>
p.role_id===roleId && p.page===page
? {...p,can_view:!current}
: p
)
)

}else{

/* create permission if missing */

await supabase
.from("permissions")
.insert({
role_id:roleId,
page:page,
can_view:true
})

setPermissions(prev => [
...prev,
{role_id:roleId,page:page,can_view:true}
])

}

}

if(!ready){
return null
}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<div className="space-y-6">

{roles.map(role=>(

<div
key={role.id}
className="bg-white p-6 rounded-xl shadow"
>

<h2 className="font-semibold text-lg text-emerald-700 mb-4 capitalize">
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

</div>

)

}