"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserProvider, useUser } from "@/lib/UserContext"
import Image from "next/image"



function DashboardShell({ children }: { children: React.ReactNode }) {

  const { username, setUsername, loading, setLoading } = useUser()

  const pathname = usePathname()

  const [status,setStatus] = useState("online")

  const [adminOpen,setAdminOpen] = useState(true)
  const [stockOpen,setStockOpen] = useState(false)
  const [employeeOpen,setEmployeeOpen] = useState(false)
  const [toolsOpen,setToolsOpen] = useState(true)



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
        .eq("id", user.id)
        .maybeSingle()

      if(profile?.username){
        setUsername(profile.username)
      } else {
        setUsername("User")
      }

      setLoading(false)

    }

    loadUser()

  },[])



  function getStatusColor(){

    if(status==="online") return "bg-green-400"
    if(status==="idle") return "bg-yellow-400"
    return "bg-gray-400"

  }



  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen text-emerald-700 font-semibold">
        Loading...
      </div>
    )
  }



  return(

  <main className="flex min-h-screen">



  {/* SIDEBAR */}

  <div className="w-[250px] bg-emerald-800 text-white flex flex-col p-6 shadow-xl">

<div className="flex items-center gap-3 mb-10">

<Image
src="/logo.png"
alt="Bean Machine"
width={58}
height={58}
/>

<h1 className="text-2xl font-extrabold tracking-wide">
Bean Machine
</h1>

</div>



  {/* USER PANEL */}

  <div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />

  <span className="font-semibold">
  {username}
  </span>

  </div>



  {/* ADMIN PANEL */}

  <div className="mb-6">

  <button
  onClick={()=>setAdminOpen(!adminOpen)}
  className="font-semibold mb-3 hover:text-emerald-200"
  >
  Admin Panel
  </button>

  {adminOpen && (

  <nav className="flex flex-col gap-2 text-sm pl-3">

  <Link
  href="/admin"
  className={`${pathname==="/admin"?"font-semibold text-white":"hover:text-emerald-200"}`}
  >
  Admin Panel Page
  </Link>

  <Link
  href="/dashboard"
  className={`${pathname==="/dashboard"?"font-semibold text-white":"hover:text-emerald-200"}`}
  >
  Dashboard
  </Link>

  </nav>

  )}

  </div>



  {/* STOCK MANAGEMENT */}

  <div className="mb-6">

  <button
  onClick={()=>setStockOpen(!stockOpen)}
  className="font-semibold mb-3 hover:text-emerald-200"
  >
  Stock Management
  </button>

  {stockOpen && (

  <nav className="flex flex-col gap-2 text-sm pl-3">

  <Link
  href="/stock"
  className={`${pathname==="/stock"?"font-semibold text-white":"hover:text-emerald-200"}`}
  >
  Stock Dashboard
  </Link>

  </nav>

  )}

  </div>



  {/* EMPLOYEE MANAGEMENT */}

  <div className="mb-6">

  <button
  onClick={()=>setEmployeeOpen(!employeeOpen)}
  className="font-semibold mb-3 hover:text-emerald-200"
  >
  Employee Management
  </button>

  {employeeOpen && (

  <nav className="flex flex-col gap-2 text-sm pl-3">

  <Link
  href="/employees"
  className={`${pathname==="/employees"?"font-semibold text-white":"hover:text-emerald-200"}`}
  >
  Employees
  </Link>

  </nav>

  )}

  </div>



  {/* USER TOOLS */}

  <div className="mb-6">

  <button
  onClick={()=>setToolsOpen(!toolsOpen)}
  className="font-semibold mb-3 hover:text-emerald-200"
  >
  User Tools
  </button>

  {toolsOpen && (

  <nav className="flex flex-col gap-2 text-sm pl-3">

  <Link
  href="/settings"
  className={`${pathname==="/settings"?"font-semibold text-white":"hover:text-emerald-200"}`}
  >
  Settings
  </Link>

  </nav>

  )}

  </div>



  {/* LOGOUT */}

  <button
  onClick={logout}
  className="mt-auto text-left hover:text-emerald-200"
  >
  Logout
  </button>



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