"use client"

import { useEffect,useState } from "react"

type Activity={
id:string
username:string
action:string
type:string
created_at:string
}

export default function ActivityFeed(){

const [logs,setLogs]=useState<Activity[]>([])
const [userFilter,setUserFilter]=useState("")
const [typeFilter,setTypeFilter]=useState("")

async function load(){

const res = await fetch("/api/activity")
const data = await res.json()

setLogs(data.logs || [])

}

useEffect(()=>{
load()
},[])

const filtered = logs.filter(log=>{

const userMatch=userFilter
? log.username.toLowerCase().includes(userFilter.toLowerCase())
: true

const typeMatch=typeFilter
? log.type===typeFilter
: true

return userMatch && typeMatch

})

return(

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Activity Feed
</h2>

{/* FILTERS */}

<div className="flex gap-2 mb-5">

<input
placeholder="Filter by user"
value={userFilter}
onChange={(e)=>setUserFilter(e.target.value)}
className="border border-emerald-400 rounded px-2 py-1 text-sm w-full"
/>

<select
value={typeFilter}
onChange={(e)=>setTypeFilter(e.target.value)}
className="border border-emerald-400 rounded px-2 py-1 text-sm"
>

<option value="">All</option>
<option value="Admin">Admin</option>
<option value="Stock">Stock</option>
<option value="Employee">Employee</option>

</select>

</div>

<div className="space-y-3 max-h-[320px] overflow-y-auto">

{filtered.length===0 &&(
<div className="text-sm text-gray-400">
No activity yet
</div>
)}

{filtered.map(log=>(

<div
key={log.id}
className="border border-emerald-200 rounded p-3"
>

<div className="flex justify-between">

<span className="font-semibold text-sm">
{log.username}
</span>

<span className="text-xs text-gray-400">
{new Date(log.created_at).toLocaleTimeString()}
</span>

</div>

<div className="text-xs text-gray-600 mt-1">
{log.action}
</div>

</div>

))}

</div>

</div>

)

}