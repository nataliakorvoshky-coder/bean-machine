"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminData } from "@/lib/AdminDataContext"

export default function ProfilePage(){

const { username } = useAdminData()

const [name,setName] = useState(username)

async function save(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

await supabase
.from("profiles")
.update({ username:name })
.eq("id",user.id)

alert("Profile updated")

}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Profile
</h1>

<div className="bg-white p-8 rounded-xl shadow max-w-[500px]">

<div className="flex flex-col gap-4">

<label className="text-emerald-700">
Username
</label>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
className="border border-emerald-300 rounded px-3 py-2"
/>

<button
onClick={save}
className="bg-emerald-600 text-white px-5 py-2 rounded w-fit"
>
Save Changes
</button>

</div>

</div>

</div>

)

}