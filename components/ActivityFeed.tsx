"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

type Activity={
id:string
username:string
action:string
type:string
created_at:string
}

export default function ActivityFeed(){

const [logs,setLogs] = useState<Activity[]>([])
const [userFilter,setUserFilter] = useState("")
const [typeFilter,setTypeFilter] = useState("")

async function loadLogs(){

const res = await fetch("/api/activity")
const data = await res.json()

setLogs(data.logs || [])

}

useEffect(()=>{

loadLogs()

const channel = supabase
.channel("activity-feed")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"activity_log"
},
(payload)=>{

setLogs((prev)=>[
payload.new as Activity,
...prev
])

}
)
.subscribe()

return()=>{
supabase.removeChannel(channel)
}

},[])

/* filter logs */

const filtered = logs.filter((log)=>{

const userMatch = userFilter
? log.username.toLowerCase().includes(userFilter.toLowerCase())
: true

const typeMatch = typeFilter
? log.type === typeFilter
: true

return userMatch && typeMatch

})

return(

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Activity Feed
</h2>

{/* FILTERS */}

<div className="flex gap-2 mb-4">

<input
placeholder="User"
value={userFilter}
onChange={(e)=>setUserFilter(e.target.value)}
className="border border-emerald-400 p-2 rounded text-sm w-full"
/>

<select
value={typeFilter}
onChange={(e)=>setTypeFilter(e.target.value)}
className="border border-emerald-400 p-2 rounded text-sm"
>

<option value="">All</option>
<option value="Admin">Admin</option>
<option value="Stock">Stock</option>
<option value="Employee">Employee</option>

</select>

</div>

{/* ACTIVITY LIST */}

<div className="space-y-3 max-h-[320px] overflow-y-auto">

{filtered.map((log)=>{

let badge="bg-gray-200 text-gray-700"

if(log.type==="Admin") badge="bg-red-100 text-red-700"
if(log.type==="Stock") badge="bg-blue-100 text-blue-700"
if(log.type==="Employee") badge="bg-purple-100 text-purple-700"

return(

<div
key={log.id}
className="border border-emerald-200 rounded p-3"
>

<div className="flex justify-between">

<span className="font-semibold text-sm">
{log.username}
</span>

<span className={`text-xs px-2 py-1 rounded ${badge}`}>
{log.type}
</span>

</div>

<div className="text-xs text-gray-600 mt-1">
{log.action}
</div>

<div className="text-xs text-gray-400 mt-1">
{new Date(log.created_at).toLocaleTimeString()}
</div>

</div>

)

})}

</div>

</div>

)

}