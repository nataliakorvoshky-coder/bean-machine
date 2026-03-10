"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")

async function updateUsername(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

await supabase
.from("profiles")
.update({ username })
.eq("id",user.id)

sessionStorage.setItem("username",username)

alert("Username updated")

}

async function updatePassword(){

await supabase.auth.updateUser({
password
})

alert("Password updated")

}

return(

<div className="w-[800px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Settings
</h1>

<div className="bg-white p-8 rounded-xl shadow space-y-6">

<div>

<p className="font-semibold mb-2">
Change Username
</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
className="border p-2 rounded w-full"
/>

<button
onClick={updateUsername}
className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded"
>
Update Username
</button>

</div>

<div>

<p className="font-semibold mb-2">
Change Password
</p>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border p-2 rounded w-full"
/>

<button
onClick={updatePassword}
className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded"
>
Update Password
</button>

</div>

</div>

</div>

)

}