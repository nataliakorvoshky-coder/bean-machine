"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function AdminPage(){

const ready = usePermission("admin")

const [users,setUsers] = useState<any[]>([])
const [roles,setRoles] = useState<any[]>([])

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const [loading,setLoading] = useState(true)

useEffect(()=>{

if(!ready) return

load()

},[ready])

async function load(){

setLoading(true)

const { data:usersData } = await supabase
.from("profiles")
.select("id,username,disabled")
.order("username")

const { data:rolesData } = await supabase
.from("roles")
.select("*")
.order("name")

setUsers(usersData || [])
setRoles(rolesData || [])

setLoading(false)

}

async function createUser(){

if(!email || !password) return

const { data,error } = await supabase.auth.signUp({
email,
password
})

if(error){
alert(error.message)
return
}

alert("User created")

setEmail("")
setPassword("")

}

async function toggleUser(user:any){

await supabase
.from("profiles")
.update({disabled:!user.disabled})
.eq("id",user.id)

setUsers(users.map(u =>
u.id === user.id
? {...u,disabled:!u.disabled}
: u
))

}

async function changeRole(userId:string,roleId:string){

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

}

if(!ready) return null

return(

<div className="w-[1100px] space-y-10">

<h1 className="text-3xl font-bold text-emerald-700">
Admin Dashboard
</h1>

{/* CREATE USER */}

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Create User
</h2>

<div className="flex gap-4">

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 w-[250px]"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2 w-[250px]"
/>

<button
onClick={createUser}
className="bg-emerald-600 text-white px-5 py-2 rounded"
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

{loading ? (

<p className="text-gray-500">
Loading users...
</p>

):( 

<div className="space-y-3">

{users.map(user=>(

<div
key={user.id}
className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
>

<span className="font-medium">
{user.username}
</span>

<div className="flex gap-3 items-center">

<select
onChange={(e)=>changeRole(user.id,e.target.value)}
className="border border-emerald-300 rounded px-2 py-1"
>

<option value="">Role</option>

{roles.map(role=>(

<option
key={role.id}
value={role.id}
>

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

)}

</div>

</div>

)

}