"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function AdminPage(){

const { users, roles, userRoles, updateUser, updateRole, reload } = useAdminData() || {}

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

/* CREATE USER */

async function createUser(){

if(!email || !password){
alert("Enter email and password")
return
}

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

reload?.()

}


/* ENABLE / DISABLE USER */

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({disabled:!user.disabled})
.eq("id",user.id)

updateUser?.({
...user,
disabled:!user.disabled
})

}


/* CHANGE ROLE */

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

updateRole?.(userId,roleId)

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
className="border border-emerald-300 rounded px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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

<span className="font-medium">
{user.username}
</span>

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

</div>

)

}