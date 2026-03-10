"use client"

import { useAdminData } from "@/lib/AdminDataContext"
import { supabase } from "@/lib/supabase"

export default function RolesPage(){

const { roles, permissions, load } = useAdminData()

const pages = ["admin","dashboard","employees","inventory","settings"]

async function toggle(roleId:string,page:string,current:boolean){

await supabase
.from("permissions")
.upsert({
role_id: roleId,
page,
can_view: !current
})

load()

}

function isEnabled(roleId:string,page:string){

const perm = permissions.find(
(p:any)=>p.role_id===roleId && p.page===page
)

return perm?.can_view || false

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<div className="grid grid-cols-2 gap-8">

{roles.map((role:any)=>{

const roleName =
role.name.charAt(0).toUpperCase() + role.name.slice(1)

return(

<div
key={role.id}
className="bg-white p-8 rounded-xl shadow"
>

<h2 className="text-xl font-semibold text-emerald-700 mb-6">
{roleName}
</h2>

<div className="flex flex-col gap-3">

{pages.map(page=>{

const enabled = isEnabled(role.id,page)

return(

<div
key={page}
className={`flex justify-between items-center border rounded-lg p-3 transition
${enabled
? "border-emerald-400 bg-emerald-50"
: "border-gray-300"}
`}
>

<span className="capitalize font-medium text-emerald-700">
{page}
</span>

<input
type="checkbox"
checked={enabled}
onChange={()=>toggle(role.id,page,enabled)}
className="w-6 h-6 cursor-pointer accent-red-500 checked:accent-emerald-600"
/>

</div>

)

})}

</div>

</div>

)

})}

</div>

</div>

)

}