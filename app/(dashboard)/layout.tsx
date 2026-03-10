"use client"

import React,{useEffect,useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {supabase} from "@/lib/supabase"
import {AdminDataProvider,useAdminData} from "@/lib/AdminDataContext"

const Sidebar = React.memo(function Sidebar(){

const pathname = usePathname()
const {canAccess} = useAdminData()

const [username,setUsername] = useState(()=>{

if(typeof window !== "undefined"){
return sessionStorage.getItem("username") || ""
}

return ""

})

const [adminOpen,setAdminOpen] = useState(true)
const [stockOpen,setStockOpen] = useState(false)
const [employeeOpen,setEmployeeOpen] = useState(false)
const [toolsOpen,setToolsOpen] = useState(true)

useEffect(()=>{

async function loadUser(){

const {data} = await supabase.auth.getUser()
const user = data?.user

if(!user) return

const {data:profile} = await supabase
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

function linkStyle(route:string){

return pathname === route
? "text-white font-bold"
: "text-emerald-300 hover:text-white hover:font-bold"

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
{username}
</span>

</div>

<nav className="flex flex-col gap-3 text-sm">

{/* ADMIN PANEL */}

{canAccess("admin") && (

<>

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-emerald-200 font-semibold text-base text-left"
>
Admin Panel
</button>

{adminOpen &&(

<div className="ml-4 flex flex-col gap-2">

<Link href="/admin" className={linkStyle("/admin")}>
Admin Dashboard
</Link>

<Link href="/dashboard" className={linkStyle("/dashboard")}>
Dashboard
</Link>

<Link href="/admin/roles" className={linkStyle("/admin/roles")}>
Roles & Permissions
</Link>

</div>

)}

</>

)}

{/* STOCK MANAGEMENT */}

{canAccess("inventory") && (

<>

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-emerald-200 font-semibold text-base mt-4 text-left"
>
Stock Management
</button>

{stockOpen &&(

<div className="ml-4 flex flex-col gap-2">

<Link href="/inventory" className={linkStyle("/inventory")}>
Inventory
</Link>

<Link href="/orders" className={linkStyle("/orders")}>
Orders
</Link>

</div>

)}

</>

)}

{/* EMPLOYEE MANAGEMENT */}

{canAccess("employees") && (

<>

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-emerald-200 font-semibold text-base mt-4 text-left"
>
Employee Management
</button>

{employeeOpen &&(

<div className="ml-4 flex flex-col gap-2">

<Link href="/employees" className={linkStyle("/employees")}>
Employees
</Link>

</div>

)}

</>

)}

{/* USER TOOLS */}

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-emerald-200 font-semibold text-base mt-4 text-left"
>
User Tools
</button>

{toolsOpen &&(

<div className="ml-4 flex flex-col gap-2">

<Link href="/settings" className={linkStyle("/settings")}>
Settings
</Link>

</div>

)}

{/* LOGOUT */}

<button
onClick={logout}
className="text-left hover:text-white mt-6 text-emerald-200"
>
Logout
</button>

</nav>

</div>

)

})

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