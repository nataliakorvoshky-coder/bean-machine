"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserProvider } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

function DashboardShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (

    <main className="flex min-h-screen">

      {/* SIDEBAR */}

      <div className="w-[260px] bg-emerald-800 text-white flex flex-col p-6">

        <h1 className="text-2xl font-bold mb-8">
          Bean Machine
        </h1>

        <nav className="flex flex-col gap-3">

          <Link
            href="/dashboard"
            className={pathname === "/dashboard"
              ? "font-semibold text-white"
              : "hover:text-emerald-200"}
          >
            Dashboard
          </Link>

          <Link
            href="/admin"
            className={pathname === "/admin"
              ? "font-semibold text-white"
              : "hover:text-emerald-200"}
          >
            Admin Dashboard
          </Link>

          <Link
            href="/settings"
            className={pathname === "/settings"
              ? "font-semibold text-white"
              : "hover:text-emerald-200"}
          >
            Settings
          </Link>

          <button
            onClick={logout}
            className="text-left hover:text-emerald-200 mt-4"
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
}: {
  children: React.ReactNode
}) {

  return (

    <UserProvider>

      <UserDataProvider>

        <DashboardShell>

          {children}

        </DashboardShell>

      </UserDataProvider>

    </UserProvider>

  )

}