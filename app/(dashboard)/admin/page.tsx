"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"
import { usePresence } from "@/lib/PresenceContext"

type Connection = {
  id: string
}

export default function AdminPage(){

const { users } = useUserData()
const connections = usePresence() as Connection[]

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")
const [isAdmin,setIsAdmin] = useState<boolean | null>(null)

const onlineIds = connections.map(c=>c.id)

/* CREATE USER */

async function createUser(){

const { data } = await supabase.auth.getUser()
const user = data?.user
if(!user) return

const res = await fetch("/api/admin/create-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
email,
password,
userId:user.id
})
})

const result = await res.json()

if(result.error){
setMessage(result.error)
}else{
setMessage("User created successfully")
setEmail("")
setPassword("")
location.reload()
}

}

/* DISABLE USER */

async function disableUser(id:string){

await fetch("/api/admin/disable-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

location.reload()

}

/* ENABLE USER */

async function enableUser(id:string){

await fetch("/api/admin/enable-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

location.reload()

}

/* ADMIN CHECK */

useEffect(()=>{

async function init(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user){
window.location.href="/"
return
}

const res = await fetch("/api/admin/check-admin",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ userId:user.id })
})

const result = await res.json()

setIsAdmin(result.admin)

}

init()

},[])

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="flex gap-12">

{/* CREATE USER PANEL */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Create User
</h2>

<label className="block text-sm mb-1">
Email
</label>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-4"
/>

<label className="block text-sm mb-1">
Temporary Password
</label>

<input
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-6"
/>

<button
onClick={createUser}
className="bg-emerald-500 text-white p-3 w-full rounded hover:bg-emerald-600"
>
Create User
</button>

{message &&(

<p className="text-sm text-gray-600 mt-4">
{message}
</p>

)}

</div>

{/* USER MANAGEMENT PANEL */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Current Users ({users.length})
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const isOnline = onlineIds.includes(u.id)

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<div
className={`w-3 h-3 rounded-full ${
isOnline ? "bg-green-400" : "bg-gray-400"
}`}
></div>

<span className="font-medium">
{u.username || u.email}
</span>

</div>

<div className="flex gap-3 text-sm">

<button
onClick={()=>disableUser(u.id)}
className="text-yellow-600 hover:text-yellow-800"
>
Disable
</button>

<button
onClick={()=>enableUser(u.id)}
className="text-green-600 hover:text-green-800"
>
Enable
</button>

</div>

</div>

)

})}

</div>

</div>

</div>

</div>

)

}