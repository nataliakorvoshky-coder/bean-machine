"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function SettingsPage(){

usePermission("settings")

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")

async function updateUsername(){

const { data:userData } = await supabase.auth.getUser()

await supabase
.from("profiles")
.update({username})
.eq("id",userData?.user?.id)

}

async function updatePassword(){

await supabase.auth.updateUser({
password
})

}

return(

<div className="w-[700px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Settings
</h1>

<div className="bg-white p-8 rounded-xl shadow space-y-8">

<div>

<p className="font-semibold mb-2">Change Username</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
className="w-full border border-emerald-300 rounded px-3 py-2"
/>

<button
onClick={updateUsername}
className="bg-emerald-600 text-white px-4 py-2 rounded mt-3"
>
Update Username
</button>

</div>

<div>

<p className="font-semibold mb-2">Change Password</p>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border border-emerald-300 rounded px-3 py-2"
/>

<button
onClick={updatePassword}
className="bg-emerald-600 text-white px-4 py-2 rounded mt-3"
>
Update Password
</button>

</div>

</div>

</div>

)

}