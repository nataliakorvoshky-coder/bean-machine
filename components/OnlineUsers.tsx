"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function OnlineUsers(){

const pathname = usePathname()

const { users, roles, userRoles } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])

/* readable page */

function pageName(path:string){

if(path.includes("dashboard")) return "Dashboard"
if(path.includes("employees")) return "Employees"
if(path.includes("inventory")) return "Inventory"
if(path.includes("settings")) return "Settings"
if(path.includes("admin")) return "Admin"

return path
}

/* status */

function statusColor(lastSeen:string){

const diff = Date.now() - new Date(lastSeen).getTime()

if(diff < 60000) return "bg-green-500"

return "bg-yellow-400"

}

useEffect(()=>{

let heartbeat:any
let fetchUsers:any

async function start(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

const userId = user.id

/* heartbeat every 10 seconds */

heartbeat = setInterval(async()=>{

await supabase
.from("online_users")
.upsert({
user_id:userId,
page:pathname,
last_seen:new Date().toISOString()
})

},10000)

/* fetch online users */

fetchUsers = setInterval(async()=>{

const { data } = await supabase
.from("online_users")
.select("*")

if(!data) return

/* filter active users */

const active = data.filter(
u => Date.now() - new Date(u.last_seen).getTime() < 120000
)

setOnlineUsers(active)

},3000)

}

start()

return ()=>{

clearInterval(heartbeat)
clearInterval(fetchUsers)

}

},[pathname])

return(

<div className="bg-white p-8 rounded-xl shadow min-h-[120px]">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Online Users
</h2>

{onlineUsers.length === 0 ?(

<p className="text-gray-500">
No users online
</p>

):( 

<div className="space-y-3">

{onlineUsers.map((u:any)=>{

const profile = users.find(
x => String(x.id) === String(u.user_id)
)

const roleId = userRoles[u.user_id]

const role = roles.find(
r => String(r.id) === String(roleId)
)

return(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className={`w-3 h-3 rounded-full ${statusColor(u.last_seen)}`}></div>

<span className="font-medium text-emerald-700">
{profile?.username || "User"}
</span>

</div>

<div className="flex items-center gap-6 text-sm">

<span className="text-emerald-700">
{role?.name || "No Role"}
</span>

<span className="text-emerald-700 italic">
{pageName(u.page)}
</span>

</div>

</div>

)

})}

</div>

)}

</div>

)

}