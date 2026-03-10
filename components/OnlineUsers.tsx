"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function OnlineUsers(){

const { users, roles, userRoles, load } = useAdminData()

const [onlineUsers,setOnlineUsers] = useState<any[]>([])

function pageName(path:string){

if(path.includes("dashboard")) return "Dashboard"
if(path.includes("employees")) return "Employees"
if(path.includes("inventory")) return "Inventory"
if(path.includes("settings")) return "Settings"
if(path.includes("admin")) return "Admin"

return "Page"

}

async function loadUsers(){

const { data } = await supabase
.from("online_users")
.select("*")

if(!data) return

const active = data.filter((u:any)=>{

const diff = Date.now() - new Date(u.last_seen).getTime()

return diff < 30000

})

setOnlineUsers(active)

}

useEffect(()=>{

let interval:any
let poll:any

async function heartbeat(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

await supabase
.from("online_users")
.upsert({
user_id:user.id,
page:window.location.pathname,
last_seen:new Date().toISOString()
})

}

heartbeat()

interval = setInterval(heartbeat,10000)

loadUsers()

poll = setInterval(loadUsers,5000)

/* realtime role updates */

const channel = supabase
.channel("role-updates")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"user_roles"
},
()=>load()
)
.subscribe()

return ()=>{

clearInterval(interval)
clearInterval(poll)

supabase.removeChannel(channel)

}

},[])

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

const profile = users.find((x:any)=>String(x.id)===String(u.user_id))

const roleId = userRoles[u.user_id]

const role = roles.find((r:any)=>String(r.id)===String(roleId))

return(

<div
key={u.user_id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-500"></div>

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