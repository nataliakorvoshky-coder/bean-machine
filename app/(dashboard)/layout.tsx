"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

import { UserProvider,useUser } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

function DashboardShell({children}:{children:React.ReactNode}){

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

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

<div className="flex items-center gap-3 mb-10">

<img src="/logo.png" className="w-10 h-10"/>

<h1 className="text-2xl font-bold">
Bean Machine
</h1>

</div>

<div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

<span className="font-semibold">
{username || "User"}
</span>

</div>

<nav className="flex flex-col gap-3 text-sm">

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-left font-semibold text-emerald-200"
>
Admin Panel
</button>

{adminOpen && (

<div className="ml-3 flex flex-col gap-2">

<Link
href="/admin"
className={pathname==="/admin"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className={pathname==="/dashboard"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Dashboard
</Link>

</div>

)}

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Stock Management
</button>

{stockOpen && (

<div className="ml-3 flex flex-col gap-2">

<Link href="#">Inventory</Link>
<Link href="#">Orders</Link>

</div>

)}

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Employee Management
</button>

{employeeOpen && (

<div className="ml-3 flex flex-col gap-2">

<Link href="#">Employees</Link>
<Link href="#">Scheduling</Link>

</div>

)}

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
User Tools
</button>

{toolsOpen && (

<div className="ml-3 flex flex-col gap-2">

<Link
href="/settings"
className={pathname==="/settings"
? "font-semibold text-white"
: "hover:text-emerald-200"}
>
Settings
</Link>

</div>

)}

<button
onClick={logout}
className="text-left hover:text-emerald-200 mt-6"
>
Logout
</button>

</nav>

</div>

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center items-start pt-20">

{children}

</div>

</main>

)

}

export default function DashboardLayout({
children
}:{children:React.ReactNode}){

return(

<UserProvider>

<UserDataProvider>

<DashboardShell>

{children}

</DashboardShell>

</UserDataProvider>

</UserProvider>

)

}