"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [showPassword,setShowPassword] = useState(false)

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

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Settings
</h1>

<div className="flex flex-col gap-8 w-[600px]">

{/* USERNAME PANEL */}

<div className="bg-white p-8 rounded-xl shadow">

<p className="text-emerald-700 font-semibold mb-3">
Change Username
</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
placeholder="Enter new username"
className="w-full border border-emerald-200 bg-emerald-50
rounded-lg px-3 py-2
focus:outline-none focus:ring-2 focus:ring-emerald-500
focus:bg-white transition"
/>

<button
onClick={updateUsername}
className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
>
Update Username
</button>

</div>

{/* PASSWORD PANEL */}

<div className="bg-white p-8 rounded-xl shadow">

<p className="text-emerald-700 font-semibold mb-3">
Change Password
</p>

<div className="relative">

<input
type={showPassword ? "text" : "password"}
value={password}
onChange={(e)=>setPassword(e.target.value)}
placeholder="Enter new password"
className="w-full border border-emerald-200 bg-emerald-50
rounded-lg px-3 py-2 pr-10
focus:outline-none focus:ring-2 focus:ring-emerald-500
focus:bg-white transition"
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-3 top-2 text-gray-500 hover:text-emerald-600"
>
{showPassword ? "Hide" : "Show"}
</button>

</div>

<button
onClick={updatePassword}
className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
>
Update Password
</button>

</div>

</div>

</div>

)

}