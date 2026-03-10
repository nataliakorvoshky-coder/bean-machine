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

<div className="w-full max-w-[600px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Settings
</h1>

<div className="bg-white p-6 rounded-xl shadow space-y-8">

{/* USERNAME */}

<div>

<p className="font-semibold mb-2">
Change Username
</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
placeholder="Enter new username"
className="w-full border border-gray-300 rounded-lg px-3 py-2
focus:outline-none focus:ring-2 focus:ring-emerald-500
focus:border-emerald-500 transition"
/>

<button
onClick={updateUsername}
className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
>
Update Username
</button>

</div>

{/* PASSWORD */}

<div>

<p className="font-semibold mb-2">
Change Password
</p>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
placeholder="Enter new password"
className="w-full border border-gray-300 rounded-lg px-3 py-2
focus:outline-none focus:ring-2 focus:ring-emerald-500
focus:border-emerald-500 transition"
/>

<button
onClick={updatePassword}
className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
>
Update Password
</button>

</div>

</div>

</div>

)

}