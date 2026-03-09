"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserProvider, useUser } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

function DashboardShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const { username, setUsername } = useUser()

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
      const user = data?.user

      if(!user){
        window.location.href="/"
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id",user.id)
        .maybeSingle()

      if(profile?.username){
        setUsername(profile.username)
      }

    }

    loadUser()

  },[])

  return(

  <main className="flex min-h-screen">

    {/* SIDEBAR */}

    <div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

      <h1 className="text-2xl font-bold mb-8">
        Bean Machine
      </h1>

      {/* USER PANEL */}

      <div className="bg-emerald-700 rounded p-3 flex items-center gap-3 shadow mb-10">

        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

        <span className="font-semibold">
          {username || "User"}
        </span>

      </div>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-3 text-sm">

        {/* ADMIN PANEL */}

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
              className={pathname==="/admin" ? "font-semibold text-white":"hover:text-emerald-200"}
            >
              Admin Dashboard
            </Link>

            <Link
              href="/dashboard"
              className={pathname==="/dashboard" ? "font-semibold text-white":"hover:text-emerald-200"}
            >
              Dashboard
            </Link>

          </div>

        )}

        {/* STOCK MANAGEMENT */}

        <button
          onClick={()=>setStockOpen(!stockOpen)}
          className="text-left font-semibold text-emerald-200 mt-4"
        >
          Stock Management
        </button>

        {stockOpen && (

          <div className="ml-3 flex flex-col gap-2">

            <Link href="#">
              Inventory
            </Link>

            <Link href="#">
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

        {employeeOpen && (

          <div className="ml-3 flex flex-col gap-2">

            <Link href="#">
              Employees
            </Link>

            <Link href="#">
              Scheduling
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

        {toolsOpen && (

          <div className="ml-3 flex flex-col gap-2">

            <Link
              href="/settings"
              className={pathname==="/settings" ? "font-semibold text-white":"hover:text-emerald-200"}
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

    {/* PAGE */}

    <div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center items-start pt-20">

      {children}

    </div>

  </main>

  )

}

export default function DashboardLayout({
  children
}:{
  children:React.ReactNode
}){

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