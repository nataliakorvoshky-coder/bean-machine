"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function AdminPage(){

const { users,load } = useAdminData()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

async function createUser(){

await supabase.auth.signUp({
email,
password
})

load()

}

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({disabled:!user.disabled})
.eq("id",user.id)

load()

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="grid grid-cols-2 gap-8">

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Create User
</h2>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 w-full"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 w-full mt-3"
/>

<button
onClick={createUser}
className="bg-emerald-600 text-white px-5 py-2 rounded mt-4"
>
Create
</button>

</div>

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Current Users
</h2>

{users.map((u:any)=>(

<div
key={u.id}
className="flex justify-between border border-emerald-300 p-3 rounded-lg mb-2"
>

<span>{u.username}</span>

<button
onClick={()=>toggleUser(u)}
className={`px-3 py-1 rounded text-white ${
u.disabled
? "bg-gray-500"
: "bg-emerald-600"
}`}
>

{u.disabled ? "Enable" : "Disable"}

</button>

</div>

))}

</div>

</div>

</div>

)

}