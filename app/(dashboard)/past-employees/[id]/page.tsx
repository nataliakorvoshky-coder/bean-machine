"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PastEmployeeProfile(){

const params = useParams()
const router = useRouter()

const id = params.id

const [employee,setEmployee] = useState<any>(null)

useEffect(()=>{

async function load(){

const res = await fetch(`/api/employees/${id}`)
const data = await res.json()

setEmployee(data)

}

load()

},[id])


async function rehire(){

await fetch(`/api/employees/${id}/rehire`,{
method:"POST"
})

router.push("/employees")

}

if(!employee) return <div className="p-10">Loading...</div>

return(

<div className="max-w-4xl mx-auto py-10">

<h1 className="text-3xl font-bold text-emerald-700 mb-8">
Employee Profile
</h1>

<div className="bg-white rounded-xl shadow p-8">

<h2 className="text-xl font-semibold mb-6">
{employee.name}
</h2>

<div className="grid grid-cols-2 gap-6 text-sm">

<div>
<div className="text-gray-500">Rank</div>
<div>{employee.rank}</div>
</div>

<div>
<div className="text-gray-500">Phone</div>
<div>{employee.phone}</div>
</div>

<div>
<div className="text-gray-500">CID</div>
<div>{employee.cid}</div>
</div>

<div>
<div className="text-gray-500">IBAN</div>
<div>{employee.iban}</div>
</div>

</div>

<button
onClick={rehire}
className="mt-8 bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
>
Rehire
</button>

</div>

</div>

)

}