"use client"

import { useEffect,useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminDataProvider } from "@/lib/AdminDataContext"

export default function DashboardLayout({
children
}:{children:React.ReactNode}){

const pathname = usePathname()

/* username hydration (prevents flash) */

const [username,setUsername] = useState(()=>{

if(typeof window !== "undefined"){
return sessionStorage.getItem("username") || ""
}

return ""

})

/* collapsible menus */

const [adminOpen,setAdminOpen] = useState(true)
const [stockOpen,setStockOpen] = useState(false)
const [employeeOpen,setEmployeeOpen] = useState(false)
const [toolsOpen,setToolsOpen] = useState(true)

/* load user */

useEffect(()=>{

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

/* logout */

async function logout(){

await supabase.auth.signOut()

window.location.href="/login"

}

return(

<AdminDataProvider>

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

<span>{username}</span>

</div>

<nav className="flex flex-col text-sm">

{/* ADMIN PANEL */}

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-left font-semibold text-emerald-200 mb-2"
>
Admin Panel
</button>

{adminOpen &&(

<div className="flex flex-col gap-3 pl-4 mb-4">

<Link
href="/admin"
className={pathname === "/admin"
? "text-white"
: "text-white/80"}
>
Admin Dashboard
</Link>

<Link
href="/dashboard"
className={pathname === "/dashboard"
? "text-white"
: "text-white/80"}
>
Dashboard
</Link>

<Link
href="/admin/roles"
className={pathname === "/admin/roles"
? "text-white"
: "text-white/80"}
>
Roles & Permissions
</Link>

</div>

)}

{/* STOCK MANAGEMENT */}

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-left font-semibold text-emerald-200 mb-2"
>
Stock Management
</button>

{stockOpen &&(

<div className="flex flex-col gap-3 pl-4 mb-4">

<Link
href="/inventory"
className={pathname === "/inventory"
? "text-white"
: "text-white/80"}
>
Inventory
</Link>

<Link
href="/orders"
className={pathname === "/orders"
? "text-white"
: "text-white/80"}
>
Orders
</Link>

</div>

)}

{/* EMPLOYEE MANAGEMENT */}

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-left font-semibold text-emerald-200 mb-2"
>
Employee Management
</button>

{employeeOpen &&(

<div className="flex flex-col gap-3 pl-4 mb-4">

<Link
href="/employees"
className={pathname === "/employees"
? "text-white"
: "text-white/80"}
>
Employees
</Link>

</div>

)}

{/* USER TOOLS */}

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-left font-semibold text-emerald-200 mb-2"
>
User Tools
</button>

{toolsOpen &&(

<div className="flex flex-col gap-3 pl-4 mb-4">

<Link
href="/settings"
className={pathname === "/settings"
? "text-white"
: "text-white/80"}
>
Settings
</Link>

</div>

)}

{/* LOGOUT */}

<button
onClick={logout}
className="text-left text-white/80 mt-6"
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

</AdminDataProvider>

)

}