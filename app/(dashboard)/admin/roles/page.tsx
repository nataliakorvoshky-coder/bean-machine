"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useAdminData } from "@/lib/AdminDataContext"

export default function RolesPage(){

const [mounted,setMounted] = useState(false)

useEffect(()=>{
setMounted(true)
},[])

if(!mounted){
return null
}

const { roles, permissions } = useAdminData()

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Roles & Permissions
</h1>

<div className="bg-white p-8 rounded-xl shadow">

{roles.map((role:any)=>(
<div key={role.id}>
{role.name}
</div>
))}

</div>

</div>

)

}