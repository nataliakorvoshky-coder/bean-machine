"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminDataProvider } from "@/lib/AdminDataContext"

function Sidebar(){

const pathname = usePathname()

const [username,setUsername] = useState("")
const [adminOpen,setAdminOpen] = useState(true)

useEffect(()=>{

const cached = sessionStorage.getItem("username")

if(cached){
setUsername(cached)
return
}

async function loadUser(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

const { data:profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.single()

if(profile?.username){

setUsername(profile.username)

sessionStorage.setItem(
"username",
profile.username
)

}

}

loadUser()

},[])

async function logout(){

await supabase.auth.signOut()

window.location.href="/login"

}

return(

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

{/* LOGO */}

<div className="flex items-center gap-3 mb-10">

<img src="/logo.png" className="w-10 h-10"/>

<h1 className="text-2xl font-bold">
Bean Machine
</h1>

</div>


{/* USER */}

<div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

<div className="w-3 h-3 rounded-full bg-green-400"></div>

<span className="font-semibold">
{username || "User"}
</span>

</div>


<nav className="flex flex-col text-sm">

{/* ADMIN PANEL */}

<div className="mt-2">

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-emerald-200 font-semibold mb-2"
>
Admin Panel
</button>

{adminOpen &&(

<div className="flex flex-col gap-2 ml-3">

<Link
href="/admin"
className="text-white"
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className="text-white"
>
Dashboard
</Link>

<Link
href="/admin/roles"
className="text-white"
>
Roles & Permissions
</Link>

</div>

)}

</div>


{/* STOCK MANAGEMENT */}

<div className="mt-8">

<p className="text-emerald-200 font-semibold mb-2">
Stock Management
</p>

<div className="flex flex-col gap-2 ml-3">

<Link
href="/inventory"
className="text-white"
>
Inventory
</Link>

<Link
href="/orders"
className="text-white"
>
Orders
</Link>

</div>

</div>


{/* EMPLOYEE MANAGEMENT */}

<div className="mt-8">

<p className="text-emerald-200 font-semibold mb-2">
Employee Management
</p>

<div className="flex flex-col gap-2 ml-3">

<Link
href="/employees"
className="text-white"
>
Employees
</Link>

</div>

</div>


{/* USER TOOLS */}

<div className="mt-8">

<p className="text-emerald-200 font-semibold mb-2">
User Tools
</p>

<div className="flex flex-col gap-2 ml-3">

<Link
href="/settings"
className="text-white"
>
Settings
</Link>

</div>

</div>


{/* LOGOUT */}

<button
onClick={logout}
className="text-left text-white mt-10"
>
Logout
</button>

</nav>

</div>

)

}

export default function DashboardLayout({children}:{children:React.ReactNode}){

return(

<AdminDataProvider>

<main className="flex min-h-screen">

<Sidebar/>

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center items-start pt-20">

{children}

</div>

</main>

</AdminDataProvider>

)

}