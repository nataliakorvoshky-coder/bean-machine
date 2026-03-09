"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserProvider, useUser } from "@/lib/UserContext"

function DashboardShell({ children }: { children: React.ReactNode }) {

const pathname = usePathname()
const { username } = useUser()

const [adminOpen,setAdminOpen] = useState(true)
const [stockOpen,setStockOpen] = useState(false)
const [employeeOpen,setEmployeeOpen] = useState(false)
const [toolsOpen,setToolsOpen] = useState(true)



async function logout(){

 await supabase.auth.signOut()
 window.location.href="/"

}



return(

<main className="flex min-h-screen">

{/* SIDEBAR */}

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6 space-y-6 shadow-xl">

{/* LOGO */}

<div className="flex items-center gap-3 mb-2">

<Image
src="/logo.png"
alt="Bean Machine"
width={48}
height={48}
/>

<h1 className="text-3xl font-bold leading-tight">
Bean Machine
</h1>

</div>



{/* USER BADGE */}

<div className="bg-emerald-700 rounded-lg px-4 py-3 flex items-center gap-3 shadow">

<div className="w-3 h-3 rounded-full bg-green-400" />

<span className="font-semibold">
{username}
</span>

</div>



{/* NAVIGATION */}

<nav className="flex flex-col gap-2 text-sm">

{/* ADMIN PANEL */}

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-emerald-300 uppercase text-xs tracking-wider mt-6 text-left"
>
Admin Panel
</button>

<div className={`flex flex-col gap-2 pl-4 transition-all duration-300 ${adminOpen ? "max-h-40" : "max-h-0 overflow-hidden"}`}>

<Link
href="/admin"
className={`block ${
 pathname === "/admin"
  ? "text-white font-semibold"
  : "hover:text-emerald-200"
}`}
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className={`block ${
 pathname === "/dashboard"
  ? "text-white font-semibold"
  : "hover:text-emerald-200"
}`}
>
Dashboard
</Link>

</div>



{/* STOCK MANAGEMENT */}

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-emerald-300 uppercase text-xs tracking-wider mt-6 text-left"
>
Stock Management
</button>

<div className={`flex flex-col gap-2 pl-4 transition-all duration-300 ${stockOpen ? "max-h-40" : "max-h-0 overflow-hidden"}`}>

<Link href="#" className="hover:text-emerald-200">
Inventory
</Link>

<Link href="#" className="hover:text-emerald-200">
Suppliers
</Link>

</div>



{/* EMPLOYEE MANAGEMENT */}

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-emerald-300 uppercase text-xs tracking-wider mt-6 text-left"
>
Employee Management
</button>

<div className={`flex flex-col gap-2 pl-4 transition-all duration-300 ${employeeOpen ? "max-h-40" : "max-h-0 overflow-hidden"}`}>

<Link href="#" className="hover:text-emerald-200">
Employees
</Link>

<Link href="#" className="hover:text-emerald-200">
Roles
</Link>

</div>



{/* USER TOOLS */}

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-emerald-300 uppercase text-xs tracking-wider mt-6 text-left"
>
User Tools
</button>

<div className={`flex flex-col gap-2 pl-4 transition-all duration-300 ${toolsOpen ? "max-h-40" : "max-h-0 overflow-hidden"}`}>

<Link
href="/settings"
className={`block ${
 pathname === "/settings"
  ? "text-white font-semibold"
  : "hover:text-emerald-200"
}`}
>
Settings
</Link>

</div>



{/* LOGOUT */}

<button
onClick={logout}
className="mt-8 text-left hover:text-emerald-200"
>
Logout
</button>

</nav>

</div>



{/* PAGE CONTENT */}

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center items-start pt-20">

{children}

</div>

</main>

)

}



export default function DashboardLayout({
 children
}:{
 children: React.ReactNode
}){

 return(
  <UserProvider>
   <DashboardShell>{children}</DashboardShell>
  </UserProvider>
 )

}