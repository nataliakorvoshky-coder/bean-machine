"use client"

import { useAdminData } from "@/lib/AdminDataContext"
import { supabase } from "@/lib/supabase"

type Role = {
id: string
name: string
}

type Permission = {
role_id: string
page: string
can_view: boolean
}

export default function RolesPage(){

const { roles, permissions, load } = useAdminData()

const pages = ["admin","dashboard","employees","inventory","settings"]

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

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<table className="w-full text-center bg-white shadow rounded-xl">

<thead>

<tr className="border-b">

<th className="p-3 text-left">Role</th>

{pages.map((p:string)=>(
<th key={p}>{p}</th>
))}

</tr>

</thead>

<tbody>

{roles.map((role:Role)=>(

<tr key={role.id} className="border-b">

<td className="p-3 text-left font-semibold text-emerald-700">
{role.name}
</td>

{pages.map((page:string)=>{

const perm = permissions.find(
(p:Permission)=>p.role_id===role.id && p.page===page
)

const enabled = perm?.can_view || false

return(

<td key={page}>

<input
type="checkbox"
checked={enabled}
onChange={()=>toggle(role.id,page,enabled)}
className="w-5 h-5 accent-emerald-600 cursor-pointer"
/>

</td>

)

})}

</tr>

))}

</tbody>

</table>

</div>

)

}