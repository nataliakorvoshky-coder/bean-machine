"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function RolesPage(){

usePermission("admin")

const [roles,setRoles] = useState<any[]>([])

useEffect(()=>{

async function load(){

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

setRoles(data || [])

}

load()

},[])

async function toggle(permissionId:string,value:boolean){

await supabase
.from("permissions")
.update({
can_view:!value
})
.eq("id",permissionId)

setRoles(r=>[...r])

}

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

<h2 className="font-semibold text-lg text-emerald-700 mb-4">
{role.name}
</h2>

<div className="space-y-2">

{role.permissions.map((p:any)=>(

<div
key={p.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span>{p.page}</span>

<button
onClick={()=>toggle(p.id,p.can_view)}
className={`px-3 py-1 rounded text-white ${
p.can_view
? "bg-emerald-600"
: "bg-gray-400"
}`}
>

{p.can_view ? "Enabled" : "Disabled"}

</button>

</div>

))}

</div>

</div>

))}

</div>

</div>

)

}