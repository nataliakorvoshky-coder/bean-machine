"use client"

import { usePermission } from "@/lib/usePermission"
import { useUserData } from "@/lib/UserDataContext"
import { usePresence } from "@/lib/PresenceContext"
import { useState } from "react"

type Connection = {
id:string
}

export default function AdminPage(){

usePermission("admin")

const { users } = useUserData()
const connections = usePresence() as Connection[]

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")

const onlineIds = connections.map(c=>c.id)

async function createUser(){

const res = await fetch("/api/admin/create-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ email,password })
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

async function disableUser(id:string){

await fetch("/api/admin/disable-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

location.reload()

}

async function enableUser(id:string){

await fetch("/api/admin/enable-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

location.reload()

}

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="flex gap-12">

{/* CREATE USER */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Create User
</h2>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-4"
/>

<input
placeholder="Temporary Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-6"
/>

<button
onClick={createUser}
className="bg-emerald-500 text-white p-3 w-full rounded"
>
Create User
</button>

{message &&(

<p className="text-sm text-gray-600 mt-4">
{message}
</p>

)}

</div>

{/* CURRENT USERS */}

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