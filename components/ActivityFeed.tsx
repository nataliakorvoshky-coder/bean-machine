"use client"

import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function ActivityFeed(){

const { users } = useAdminData()

const [mounted,setMounted] = useState(false)
const [activities,setActivities] = useState<any[]>([])
const [selectedUser,setSelectedUser] = useState("")
const [selectedType,setSelectedType] = useState("")

/* ensure client render */

useEffect(()=>{
setMounted(true)
},[])

/* load activity */

async function loadActivity(){

const { data } = await supabase
.from("activity_log")
.select("*")
.order("created_at",{ ascending:false })
.limit(50)

setActivities(data || [])

}

/* realtime activity */

useEffect(()=>{

loadActivity()

const channel = supabase
.channel("activity-feed")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"activity_log"
},
payload=>{

setActivities(prev=>[
payload.new,
...prev
])

}
)
.subscribe()

return ()=>{

supabase.removeChannel(channel)

}

},[])

/* filtering */

const filtered = activities.filter(a=>{

if(selectedUser && a.user_id !== selectedUser) return false

if(selectedType && a.type !== selectedType) return false

return true

})

/* prevent hydration mismatch */

if(!mounted){
return null
}

return(

<div className="bg-white p-8 rounded-xl shadow">

<div className="flex justify-between items-center mb-6">

<h2 className="text-lg font-semibold text-emerald-700">
Activity Feed
</h2>

<div className="flex gap-3">

<select
value={selectedUser}
onChange={e=>setSelectedUser(e.target.value)}
className="border border-emerald-400 px-3 py-2 rounded"
>

<option value="">
All Users
</option>

{users?.length > 0 && users.map((u:any)=>(

<option key={u.id} value={u.id}>
{u.username}
</option>

))}

</select>

<select
value={selectedType}
onChange={e=>setSelectedType(e.target.value)}
className="border border-emerald-400 px-3 py-2 rounded"
>

<option value="">
All Types
</option>

<option value="login">
Login
</option>

<option value="role_change">
Role Change
</option>

<option value="permission_change">
Permission Change
</option>

<option value="user_disable">
User Disable
</option>

</select>

</div>

</div>

{filtered.length === 0 ?(

<p className="text-gray-500">
No activity yet
</p>

):( 

<div className="space-y-2">

{filtered.map(a=>{

const user = users.find(u=>u.id === a.user_id)

return(

<div
key={a.id}
className="border border-emerald-200 rounded p-3 flex justify-between"
>

<span className="text-emerald-700">

<strong>
{user?.username || "User"}
</strong>

{" "}
{a.action}

</span>

<span className="text-sm text-gray-500">

{new Date(a.created_at).toLocaleTimeString()}

</span>

</div>

)

})}

</div>

)}

</div>

)

}