"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PastEmployeesPage(){

const [employees,setEmployees] = useState<any[]>([])

useEffect(()=>{

async function load(){

const res = await fetch("/api/past-employees")
const data = await res.json()

setEmployees(data)

}

load()

},[])

return(

<div className="max-w-4xl mx-auto py-10">

<h1 className="text-3xl font-bold text-emerald-700 mb-8">
Past Employees
</h1>

<div className="bg-white rounded-xl shadow border">

<div className="grid grid-cols-3 px-6 py-3 border-b text-sm font-semibold text-gray-600">

<div>Name</div>
<div>Status</div>
<div>Rank</div>

</div>

{employees.map(emp=>(

<Link
key={emp.id}
href={`/past-employees/${emp.id}`}
className="grid grid-cols-3 px-6 py-4 border-b hover:bg-gray-50"
>

<div className="text-emerald-700 font-medium">
{emp.name}
</div>

<div>
{emp.status}
</div>

<div>
{emp.employee_ranks?.rank_name ?? "-"}
</div>

</Link>

))}

</div>

</div>

)

}