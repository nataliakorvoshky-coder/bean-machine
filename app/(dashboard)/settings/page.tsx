"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function SettingsPage(){

const ready = usePermission("settings")

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")

/* load current username */

useEffect(()=>{

if(!ready) return

async function load(){

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user) return

const { data } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.maybeSingle()

if(data?.username){
setUsername(data.username)
}

}

load()

},[ready])

/* update username */

async function updateUsername(){

const { data:userData } = await supabase.auth.getUser()

await supabase
.from("profiles")
.update({username})
.eq("id",userData?.user?.id)

}

/* update password */

async function updatePassword(){

await supabase.auth.updateUser({
password
})

setPassword("")

}

/* wait for permission check */

if(!ready){
return null
}

return(

<div className="w-[700px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Settings
</h1>

<div className="bg-white p-8 rounded-xl shadow space-y-10">

{/* USERNAME PANEL */}

<div>

<p className="font-semibold mb-2">
Change Username
</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
/>

<button
onClick={updateUsername}
className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded mt-3"
>
Update Username
</button>

</div>

{/* PASSWORD PANEL */}

<div>

<p className="font-semibold mb-2">
Change Password
</p>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
/>

<button
onClick={updatePassword}
className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded mt-3"
>
Update Password
</button>

</div>

</div>

</div>

)

}