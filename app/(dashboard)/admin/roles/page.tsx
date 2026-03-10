"use client"

import { useAdminData } from "@/lib/AdminDataContext"
import { supabase } from "@/lib/supabase"

export default function RolesPage(){

const { roles,permissions,load } = useAdminData()

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

<table className="w-full bg-white shadow rounded-xl">

<thead>

<tr className="border-b border-emerald-400 text-emerald-700">

<th className="p-4 text-left">
Role
</th>

{pages.map(page=>(

<th key={page} className="p-4 capitalize">
{page}
</th>

))}

</tr>

</thead>

<tbody>

{roles.map((role:any)=>(

<tr
key={role.id}
className="border-b border-emerald-200"
>

<td className="p-4 font-semibold text-emerald-700">
{role.name}
</td>

{pages.map(page=>{

const perm = permissions.find(
(p:any)=>p.role_id===role.id && p.page===page
)

const enabled = perm?.can_view || false

return(

<td key={page} className="text-center">

<input
type="checkbox"
checked={enabled}
onChange={()=>toggle(role.id,page,enabled)}
className={`w-6 h-6 cursor-pointer transition
${enabled
? "accent-emerald-600 shadow-[0_0_8px_emerald]"
: "accent-red-500"}
`}
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