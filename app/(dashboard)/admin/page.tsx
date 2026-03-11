"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"
import OnlineUsers from "@/components/OnlineUsers"

export default function AdminPage(){

const { users, load } = useAdminData()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

async function createUser(){

const { error } = await supabase.auth.signUp({
email,
password
})

if(error){
alert(error.message)
return
}

setEmail("")
setPassword("")

await load()

}

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({ disabled: !user.disabled })
.eq("id",user.id)

await load()

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="grid grid-cols-2 gap-8">

<OnlineUsers/>

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Create User
</h2>

<div className="flex flex-col gap-4">

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2"
/>

<button
onClick={createUser}
className="bg-emerald-600 text-white px-5 py-2 rounded w-fit"
>
Create
</button>

</div>

</div>

</div>

<div className="bg-white p-8 rounded-xl shadow mt-8">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Current Users
</h2>

<div className="space-y-3">

{users.map((user:any)=>(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span>{user.username}</span>

<button
onClick={()=>toggleUser(user)}
className={`px-3 py-1 rounded text-white ${
user.disabled
? "bg-gray-500"
: "bg-emerald-600"
}`}
>

{user.disabled ? "Enable" : "Disable"}

</button>

</div>

))}

</div>

</div>

</div>

)

}