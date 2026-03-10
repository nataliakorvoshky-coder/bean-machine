"use client"

import { usePermission } from "@/lib/usePermission"

export default function EmployeesPage(){

const ready = usePermission("employees")

/* wait for permission validation */

if(!ready){
return null
}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Employees
</h1>

<div className="bg-white p-8 rounded-xl shadow">

<p className="text-gray-600">
Employee tools will appear here.
</p>

</div>

</div>

)

}