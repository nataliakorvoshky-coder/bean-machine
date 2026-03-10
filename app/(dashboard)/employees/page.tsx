"use client"

import { usePermission } from "@/lib/usePermission"

export default function EmployeesPage(){

usePermission("employees")

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Employee Management
</h1>

<div className="bg-white p-8 rounded-xl shadow">

<p className="text-gray-600">
Employee management tools will appear here.
</p>

</div>

</div>

)

}