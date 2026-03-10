"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function AdminPage(){

const { users,roles,userRoles,load } = useAdminData()

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

load()

}

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({disabled:!user.disabled})
.eq("id",user.id)

load()

}

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

load()

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="grid grid-cols-2 gap-8">

{/* CREATE USER */}

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Create User
</h2>

<div className="flex flex-col gap-4">

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-200"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-200"
/>

<button
onClick={createUser}
className="bg-emerald-600 text-white px-5 py-2 rounded w-fit"
>
Create
</button>

</div>

</div>

{/* CURRENT USERS */}

<div className="bg-white p-8 rounded-xl shadow">

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

<div className="flex gap-3">

<select
value={userRoles[user.id] || ""}
onChange={(e)=>changeRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-2 py-1"
>

<option value="">Role</option>

{roles.map((role:any)=>(
<option key={role.id} value={role.id}>
{role.name}
</option>
))}

</select>

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

</div>

))}

</div>

</div>

</div>

</div>

)

}