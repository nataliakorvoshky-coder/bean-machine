"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminDataProvider } from "@/lib/AdminDataContext"

export default function DashboardLayout({ children }:{children:React.ReactNode}){

const pathname = usePathname()

const [username,setUsername] = useState(()=>{

if(typeof window !== "undefined"){
return sessionStorage.getItem("username") || ""
}

return ""

})

const [stockOpen,setStockOpen] = useState(false)
const [employeeOpen,setEmployeeOpen] = useState(false)
const [toolsOpen,setToolsOpen] = useState(true)

useEffect(()=>{

async function loadUser(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user) return

const { data:profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.maybeSingle()

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
window.location.href="/"

}

return(

<main className="flex min-h-screen">

{/* SIDEBAR */}

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

<nav className="flex flex-col gap-3 text-sm">

{/* ADMIN PANEL */}

<div className="mt-6">

<p className="text-emerald-200 font-semibold mb-2">
Admin Panel
</p>

<div className="flex flex-col gap-2 ml-2">

<Link
href="/admin"
className={pathname === "/admin"
? "font-semibold text-white"
: "text-emerald-100 hover:text-white"}
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className={pathname === "/dashboard"
? "font-semibold text-white"
: "text-emerald-100 hover:text-white"}
>
Dashboard
</Link>

<Link
href="/admin/roles"
className={pathname === "/admin/roles"
? "font-semibold text-white"
: "text-emerald-100 hover:text-white"}
>
Roles & Permissions
</Link>

</div>

</div>

{/* STOCK MANAGEMENT */}

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Stock Management
</button>

{stockOpen &&(

<div className="ml-3 flex flex-col gap-2">

<Link
href="/inventory"
className={pathname === "/inventory"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Inventory
</Link>

<Link
href="/orders"
className={pathname === "/orders"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Orders
</Link>

</div>

)}

{/* EMPLOYEE MANAGEMENT */}

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Employee Management
</button>

{employeeOpen &&(

<div className="ml-3 flex flex-col gap-2">

<Link
href="/employees"
className={pathname === "/employees"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Employees
</Link>

</div>

)}

{/* USER TOOLS */}

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
User Tools
</button>

{toolsOpen &&(

<div className="ml-3 flex flex-col gap-2">

<Link
href="/settings"
className={pathname === "/settings"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Settings
</Link>

</div>

)}

{/* LOGOUT */}

<button
onClick={logout}
className="text-left hover:text-emerald-200 mt-6"
>
Logout
</button>

</nav>

</div>

{/* PAGE CONTENT */}

<AdminDataProvider>

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center items-start pt-20">

{children}

</div>

</AdminDataProvider>

</main>

)

}