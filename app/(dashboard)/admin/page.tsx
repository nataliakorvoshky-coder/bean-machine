"use client"

import { usePermission } from "@/lib/usePermission"
import { useUserData } from "@/lib/UserDataContext"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage(){

usePermission("admin")

const { users } = useUserData()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

/* CREATE USER */

async function createUser(){

const res = await fetch("/api/admin/create-user",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
})

setEmail("")
setPassword("")

}

/* TOGGLE USER */

async function toggleUser(id:string,disabled:boolean){

await supabase
.from("profiles")
.update({
disabled:!disabled
})
.eq("id",id)

window.location.reload()

}

return(

<div className="w-[1000px] flex gap-12">

{/* CREATE USER */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Create User
</h2>

<div className="flex flex-col gap-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400"
/>

<button
onClick={createUser}
className="bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
>
Create User
</button>

</div>

</div>

{/* CURRENT USERS */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Current Users
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username || "User"}
</span>

<button
onClick={()=>toggleUser(u.id,u.disabled)}
className={`px-4 py-1 rounded-lg text-white ${
u.disabled
? "bg-gray-500"
: "bg-emerald-600"
}`}
>

{u.disabled ? "Enable" : "Disable"}

</button>

</div>

)

})}

</div>

</div>

</div>

)

}