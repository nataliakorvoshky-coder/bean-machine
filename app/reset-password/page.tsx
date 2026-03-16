"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage(){

const router = useRouter()

const [password,setPassword] = useState("")
const [loading,setLoading] = useState(false)
const [ready,setReady] = useState(false)

useEffect(()=>{

async function handleRecovery(){

// This reads the hash and sets the session automatically
const { data } = await supabase.auth.getSession()

if(data.session){
setReady(true)
}

}

handleRecovery()

},[])

async function updatePassword(){

setLoading(true)

const { error } = await supabase.auth.updateUser({
password
})

setLoading(false)

if(error){
alert(error.message)
return
}

alert("Password updated successfully")

router.push("/")

}

if(!ready){
return (
<div className="min-h-screen flex items-center justify-center">
Processing reset link...
</div>
)
}

return(

<div className="min-h-screen flex items-center justify-center bg-emerald-100">

<div className="bg-white p-10 rounded-2xl shadow-xl w-[360px]">

<h1 className="text-2xl font-bold text-emerald-700 mb-6 text-center">
Reset Password
</h1>

<input
type="password"
placeholder="New password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border border-emerald-300 p-3 w-full rounded mb-4 focus:ring-2 focus:ring-emerald-500"
/>

<button
onClick={updatePassword}
disabled={loading}
className="bg-emerald-600 text-white p-3 rounded w-full hover:bg-emerald-700"
>
{loading ? "Updating..." : "Update Password"}
</button>

</div>

</div>

)

}