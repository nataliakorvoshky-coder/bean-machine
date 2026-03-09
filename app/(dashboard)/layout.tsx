"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserProvider, useUser } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

function DashboardShell({ children }: { children: React.ReactNode }) {

const pathname = usePathname()
const { username } = useUser()

async function logout(){

await supabase.auth.signOut()
window.location.href="/"

}

return(

<main className="flex min-h-screen">

{/* SIDEBAR */}

<div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6 space-y-6 shadow-xl">

{/* LOGO */}

<div className="flex items-center gap-3 mb-4">

<Image
src="/logo.png"
alt="Bean Machine"
width={42}
height={42}
/>

<h1 className="text-3xl font-bold">
Bean Machine
</h1>

</div>

{/* USER */}

<div className="bg-emerald-700 rounded-lg px-4 py-3 flex items-center gap-3">

<div className="w-3 h-3 rounded-full bg-green-400" />

<span className="font-semibold">
{username || "User"}
</span>

</div>

{/* NAVIGATION */}

<nav className="flex flex-col gap-4 text-sm mt-6">

<p className="text-emerald-300 uppercase text-xs tracking-wider">
Admin Panel
</p>

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

<p className="text-emerald-300 uppercase text-xs tracking-wider mt-6">
User Tools
</p>

<Link
href="/settings"
className={pathname==="/settings" ? "font-semibold text-white" : "hover:text-emerald-200"}
>
Settings
</Link>

<button
onClick={logout}
className="text-left hover:text-emerald-200 mt-6"

>

Logout </button>

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
<UserDataProvider>
<DashboardShell>{children}</DashboardShell>
</UserDataProvider>
</UserProvider>

)

}
