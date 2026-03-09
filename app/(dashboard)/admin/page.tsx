"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

export default function AdminPage(){

const { users } = useUserData()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")

async function createUser(){

const res = await fetch("/api/admin/create-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
email,
password
})
})

const result = await res.json()

if(result.error){

setMessage(result.error)

}else{

setMessage("User created successfully")

setEmail("")
setPassword("")

/* LOG ACTIVITY */

const { data } = await supabase.auth.getUser()

await fetch("/api/activity/create",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body: JSON.stringify({
username:data?.user?.email,
action:"Created new user",
type:"Admin"
})
})

}

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

<label className="block text-sm mb-1">
Email
</label>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-4 focus:ring-2 focus:ring-emerald-400"
/>

<label className="block text-sm mb-1">
Temporary Password
</label>

<input
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-6 focus:ring-2 focus:ring-emerald-400"
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

{/* USER LIST */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Current Users ({users.length})
</h2>

<div className="space-y-3">

{users.map((u:any)=>(

<div
key={u.id}
className="border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username ?? u.email}
</span>

</div>

))}

</div>

</div>

</div>

</div>

)

}