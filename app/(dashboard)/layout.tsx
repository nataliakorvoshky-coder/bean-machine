"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import { UserProvider, useUser } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"
import { PresenceProvider } from "@/lib/PresenceContext"

function DashboardShell({ children }: { children: React.ReactNode }) {

const pathname = usePathname()

const { username, setUsername } = useUser()

const [status,setStatus] = useState("online")

async function logout(){

await supabase.auth.signOut()

window.location.href="/"

}

useEffect(()=>{

async function loadUser(){

const { data } = await supabase.auth.getUser()

const user = data.user

if(!user){
window.location.href="/"
return
}

const { data: profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.maybeSingle()

if(profile?.username){
setUsername(profile.username)
}

}

loadUser()

},[])

function getStatusColor(){

if(status==="online") return "bg-green-400"
if(status==="idle") return "bg-yellow-400"

return "bg-gray-400"

}

return(

<main className="flex min-h-screen">

{/* SIDEBAR */}

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

{/* HEADER */}

<div className="flex items-center gap-3 mb-10">

<img src="/logo.png" className="w-10 h-10"/>

<h1 className="text-2xl font-bold">
Bean Machine
</h1>

</div>

{/* USER PANEL */}

<div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

<div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />

<span className="font-semibold">
{username || "User"}
</span>

</div>

{/* NAVIGATION */}

<nav className="flex flex-col gap-5 text-sm">

<Link
href="/admin"
className={pathname==="/admin" ? "font-semibold text-white" : "hover:text-emerald-200"}
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className={pathname==="/dashboard" ? "font-semibold text-white" : "hover:text-emerald-200"}
>
Dashboard
</Link>

<Link
href="/settings"
className={pathname==="/settings" ? "font-semibold text-white" : "hover:text-emerald-200"}
>
Settings
</Link>

<button
onClick={logout}
className="text-left hover:text-emerald-200"

>

Logout </button>

</nav>

</div>

{/* CONTENT */}

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center pt-20">

{children}

</div>

</main>

)

}

export default function DashboardLayout({
children
}:{ children: React.ReactNode }){

return(

<UserProvider>

<UserDataProvider>

<PresenceProvider>

<DashboardShell>

{children}

</DashboardShell>

</PresenceProvider>

</UserDataProvider>

</UserProvider>

)

}
