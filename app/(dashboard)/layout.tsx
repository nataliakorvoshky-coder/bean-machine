"use client"

import { useEffect,useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminDataProvider,useAdminData } from "@/lib/AdminDataContext"

function LayoutShell({children}:{children:React.ReactNode}){

const pathname = usePathname()
const { canAccess } = useAdminData()

const [username,setUsername] = useState("")

const [stockOpen,setStockOpen] = useState(false)
const [employeeOpen,setEmployeeOpen] = useState(false)

useEffect(()=>{

async function load(){

const { data } = await supabase.auth.getUser()

const user = data?.user

if(!user) return

const { data:profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.maybeSingle()

setUsername(profile?.username || "")

}

load()

},[])

async function logout(){

await supabase.auth.signOut()

window.location.href="/"

}

return(

<main className="flex min-h-screen">

{/* SIDEBAR */}

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

<div className="flex items-center gap-3 mb-10">

<img src="/logo.png" className="w-10 h-10"/>

<h1 className="text-2xl font-bold">
Bean Machine
</h1>

</div>

<div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

<div className="w-3 h-3 rounded-full bg-green-400"></div>

<span className="font-semibold">
{username || "User"}
</span>

</div>

<nav className="flex flex-col gap-3 text-sm">

{/* ADMIN */}

{canAccess("admin") && (

<>

<p className="text-emerald-200 font-semibold">
Admin Panel
</p>

<Link href="/admin">
Admin Dashboard
</Link>

<Link href="/admin/roles">
Roles & Permissions
</Link>

</>

)}

{/* DASHBOARD */}

{canAccess("dashboard") && (

<Link href="/dashboard">
Dashboard
</Link>

)}

{/* STOCK */}

{canAccess("inventory") && (

<>

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Stock Management
</button>

{stockOpen &&(

<div className="ml-3 flex flex-col gap-2">

<Link href="/inventory">
Inventory
</Link>

<Link href="/orders">
Orders
</Link>

</div>

)}

</>

)}

{/* EMPLOYEES */}

{canAccess("employees") && (

<>

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-left font-semibold text-emerald-200 mt-4"
>
Employee Management
</button>

{employeeOpen &&(

<Link href="/employees">
Employees
</Link>

)}

</>

)}

<Link href="/settings">
Settings
</Link>

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

export default function DashboardLayout({children}:{children:React.ReactNode}){

return(

<AdminDataProvider>

<LayoutShell>

{children}

</LayoutShell>

</AdminDataProvider>

)

}