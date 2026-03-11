"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Username from "@/components/Username"

export default function Sidebar(){

const pathname = usePathname()

const [adminOpen,setAdminOpen] = useState(true)
const [stockOpen,setStockOpen] = useState(true)
const [employeeOpen,setEmployeeOpen] = useState(true)
const [toolsOpen,setToolsOpen] = useState(true)

async function logout(){
await supabase.auth.signOut()
window.location.href="/login"
}

/* ACTIVE LINK STYLE */

function linkClass(path:string){

const active = pathname === path

if(active){

return "bg-emerald-600 text-white font-semibold px-3 py-2 rounded-md"

}

return "text-white/90 hover:bg-emerald-700 hover:text-white px-3 py-2 rounded-md transition"

}

return(

<div className="w-[260px] bg-emerald-800 min-h-screen flex flex-col justify-between p-6">

<div>

{/* LOGO */}

<div className="flex items-center gap-3 mb-10">

<img
src="/logo.png"
className="w-10"
/>

<h1 className="text-white text-xl font-bold">
Bean Machine
</h1>

</div>


{/* USER */}

<div className="flex items-center gap-3 bg-emerald-700 rounded-lg px-4 py-3 mb-10">

<div className="w-3 h-3 rounded-full bg-green-400"></div>

<span className="text-white text-sm">
<Username/>
</span>

</div>


{/* ADMIN PANEL */}

<div className="mb-8">

<button
onClick={()=>setAdminOpen(!adminOpen)}
className="text-emerald-200 text-lg font-semibold mb-3"
>
Admin Panel
</button>

{adminOpen &&(

<div className="flex flex-col gap-1">

<Link href="/admin" className={linkClass("/admin")}>
Admin Dashboard
</Link>

<Link href="/dashboard" className={linkClass("/dashboard")}>
Dashboard
</Link>

<Link href="/admin/roles" className={linkClass("/admin/roles")}>
Roles & Permissions
</Link>

<Link href="/admin/stock-items" className={linkClass("/admin/stock-items")}>
Stock Items
</Link>

<Link href="/admin/stock-conversions" className={linkClass("/admin/stock-conversions")}>
  Item Conversions
</Link>

</div>

)}

</div>


{/* STOCK MANAGEMENT */}

<div className="mb-8">

<button
onClick={()=>setStockOpen(!stockOpen)}
className="text-emerald-200 text-lg font-semibold mb-3"
>
Stock Management
</button>

{stockOpen &&(

<div className="flex flex-col gap-1">

<Link href="/inventory" className={linkClass("/inventory")}>
Stock Overview
</Link>

<Link href="/restocking" className={linkClass("/restocking")}>
Restocking
</Link>

</div>

)}

</div>


{/* EMPLOYEE MANAGEMENT */}

<div className="mb-8">

<button
onClick={()=>setEmployeeOpen(!employeeOpen)}
className="text-emerald-200 text-lg font-semibold mb-3"
>
Employee Management
</button>

{employeeOpen &&(

<div className="flex flex-col gap-1">

<Link href="/employees" className={linkClass("/employees")}>
Employees
</Link>

<Link href="/submit-hours" className={linkClass("/submit-hours")}>
Submit Hours
</Link>

</div>

)}

</div>


{/* USER TOOLS */}

<div className="mb-8">

<button
onClick={()=>setToolsOpen(!toolsOpen)}
className="text-emerald-200 text-lg font-semibold mb-3"
>
User Tools
</button>

{toolsOpen &&(

<div className="flex flex-col gap-1">

<Link href="/profile" className={linkClass("/profile")}>
Profile
</Link>

<Link href="/settings" className={linkClass("/settings")}>
Settings
</Link>

</div>

)}

</div>

</div>


{/* LOGOUT */}

<div>

<button
onClick={logout}
className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm"
>
Logout
</button>

</div>

</div>

)

}