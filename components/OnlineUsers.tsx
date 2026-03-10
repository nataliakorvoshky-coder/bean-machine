"use client"

import { useAdminData } from "@/lib/AdminDataContext"

export default function OnlineUsers(){

const { users,roles,userRoles } = useAdminData()

return(

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Online Users
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const roleId = userRoles?.[u.id]

const roleName =
roles.find((r:any)=>r.id===roleId)?.name || "No Role"

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username}
</span>

<span className="text-xs text-emerald-700">
{roleName}
</span>

</div>

)

})}

</div>

</div>

)

}