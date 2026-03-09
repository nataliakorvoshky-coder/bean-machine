"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/UserContext"

export default function DashboardLayout({
  children
}:{
  children: React.ReactNode
}){

  const pathname = usePathname()
  const { username } = useUser()

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

        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

        <span className="font-semibold">
          {username}
        </span>

      </div>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-4 text-sm">

        <Link
          href="/dashboard"
          className={pathname==="/dashboard"
          ? "font-semibold text-white"
          : "hover:text-emerald-200"}
        >
          Dashboard
        </Link>

        <Link
          href="/admin"
          className={pathname==="/admin"
          ? "font-semibold text-white"
          : "hover:text-emerald-200"}
        >
          Admin Dashboard
        </Link>

        <Link
          href="/settings"
          className={pathname==="/settings"
          ? "font-semibold text-white"
          : "hover:text-emerald-200"}
        >
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

    {/* PAGE */}

    <div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center pt-20">

      {children}

    </div>

  </main>

  )

}