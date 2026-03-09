"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage(){

const [users,setUsers] = useState<any[]>([])
const [presence,setPresence] = useState<any>({})
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")
const [status,setStatus] = useState("active")
const [isAdmin,setIsAdmin] = useState(false)
const [loading,setLoading] = useState(true)

async function loadUsers(){

const res = await fetch("/api/admin/list-users")
const data = await res.json()

setUsers(data.users || [])

}

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
loadUsers()

}

}

async function deleteUser(id:string){

const confirmDelete = confirm("Delete this user?")

if(!confirmDelete) return

await fetch("/api/admin/delete-user",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ id })
})

loadUsers()

}

useEffect(()=>{

async function init(){

const { data } = await supabase.auth.getUser()
const user = data.user

if(!user){
window.location.href="/"
return
}

const adminRes = await fetch("/api/admin/check-admin",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ userId:user.id })
})

const adminData = await adminRes.json()

if(!adminData.admin){
window.location.href="/"
return
}

setIsAdmin(true)

await loadUsers()

setLoading(false)

}

init()

},[])

useEffect(()=>{

let channel:any

async function startPresence(){

const { data } = await supabase.auth.getUser()
const user = data.user

if(!user) return

channel = supabase.channel("online-users",{
config:{
presence:{ key:user.id }
}
})

channel
.on("presence",{event:"sync"},()=>{
const state = channel.presenceState()
setPresence(state)
})
.subscribe(async(statusResp:any)=>{

if(statusResp==="SUBSCRIBED"){

await channel.track({
user:user.id,
status
})

}

})

}

startPresence()

return ()=>{
if(channel){
supabase.removeChannel(channel)
}
}

},[status])

if(!isAdmin || loading) return null

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

>

Create User </button>

{message &&(

<p className="text-sm text-gray-600 mt-4">
{message}
</p>
)}

</div>

{/* USERS */}

<div className="w-[420px] bg-white p-8 rounded-xl shadow">

<h2 className="font-semibold mb-6 text-emerald-700">
Current Users ({users.length})
</h2>

<div className="space-y-3">

{users.map((u:any)=>{

const state = presence[u.id]

let color="bg-gray-400"
let text="Offline"

if(state){

const userState = state[0]?.status

if(userState==="active"){
color="bg-green-400"
text="Active"
}

if(userState==="idle"){
color="bg-yellow-400"
text="Idle"
}

}

return(

<div
key={u.id}
className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
>

<span className="font-medium">
{u.username || u.email}
</span>

<div className="flex items-center gap-3">

<div className="flex items-center gap-2">

<div className={`w-3 h-3 rounded-full ${color}`} />

<span className="text-sm text-gray-500">
{text}
</span>

</div>

<button
onClick={()=>deleteUser(u.id)}
className="text-red-500 hover:text-red-700 text-sm"

>

Delete </button>

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
