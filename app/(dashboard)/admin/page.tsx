"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/lib/UserDataContext"

export default function AdminPage(){

const { users, refreshUsers } = useUserData()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")
const [isAdmin,setIsAdmin] = useState(false)

/* ADMIN CHECK */

useEffect(()=>{

async function checkAdmin(){

const { data } = await supabase.auth.getUser()
const user = data.user

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

if(result.admin){
setIsAdmin(true)
}

}

checkAdmin()

},[])

/* CREATE USER */

async function createUser(){

const { data } = await supabase.auth.getUser()
const user = data.user

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

await refreshUsers()

}

}

/* DELETE USER */

async function deleteUser(id:string){

const confirmDelete = confirm("Delete this user?")

if(!confirmDelete) return

await fetch("/api/admin/delete-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

await refreshUsers()

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
className="border border-emerald-400 p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
/>

<label className="block text-sm mb-1">
Temporary Password
</label>

<input
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-400 p-3 w-full rounded mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400"
/>

<button
onClick={createUser}
className="bg-emerald-500 text-white p-3 w-full rounded hover:bg-emerald-600"
disabled={!isAdmin}

>

Create User </button>

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

{users.length === 0 ? (

<p className="text-gray-400 text-sm">
No users found
</p>

) : users.map((u:any)=>{

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username || "User"}
</span>

<button
onClick={()=>deleteUser(u.id)}
className="text-red-500 hover:text-red-700 text-sm"
disabled={!isAdmin}

>

Delete </button>

</div>

)

})}

</div>

</div>

</div>

</div>

)

}
