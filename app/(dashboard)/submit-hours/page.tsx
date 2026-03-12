"use client"

import { useEffect, useState } from "react"

export default function SubmitHoursPage(){

const [employees,setEmployees] = useState<any[]>([])
const [employee,setEmployee] = useState("")
const [date,setDate] = useState("")
const [hours,setHours] = useState("")
const [minutes,setMinutes] = useState("0")

useEffect(()=>{

async function loadEmployees(){

const res = await fetch("/api/employees")
const data = await res.json()

setEmployees(data)

}

loadEmployees()

},[])


async function submitHours(e:any){

e.preventDefault()

await fetch("/api/hours/submit",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
employee_id:employee,
work_date:date,
hours,
minutes
})
})

alert("Hours submitted")

setHours("")
setMinutes("0")

}


return(

<div className="max-w-2xl mx-auto py-12">

<h1 className="text-4xl font-bold text-emerald-700 mb-10">
Submit Hours
</h1>


<div className="bg-white rounded-lg border border-gray-200 p-8">

<form
onSubmit={submitHours}
className="space-y-7"
>


{/* EMPLOYEE */}

<div className="flex flex-col">

<label className="text-sm text-gray-600 mb-1">
Employee
</label>

<select
required
value={employee}
onChange={e=>setEmployee(e.target.value)}
className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
>

<option value="">Select employee</option>

{employees.map(emp=>(
<option key={emp.id} value={emp.id}>
{emp.name}
</option>
))}

</select>

</div>


{/* DATE */}

<div className="flex flex-col">

<label className="text-sm text-gray-600 mb-1">
Work Date
</label>

<input
type="date"
required
value={date}
onChange={e=>setDate(e.target.value)}
className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
/>

</div>


{/* HOURS ROW */}

<div className="grid grid-cols-2 gap-6">

<div className="flex flex-col">

<label className="text-sm text-gray-600 mb-1">
Hours
</label>

<input
type="number"
required
value={hours}
onChange={e=>setHours(e.target.value)}
className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
placeholder="8"
/>

</div>


<div className="flex flex-col">

<label className="text-sm text-gray-600 mb-1">
Minutes
</label>

<select
value={minutes}
onChange={e=>setMinutes(e.target.value)}
className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
>

<option value="0">0</option>
<option value="15">15</option>
<option value="30">30</option>
<option value="45">45</option>

</select>

</div>

</div>


{/* BUTTON */}

<div className="pt-3">

<button
type="submit"
className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 transition"
>
Submit Hours
</button>

</div>

</form>

</div>

</div>

)

}