"use client"

import { ReactNode } from "react"
import Sidebar from "@/components/Sidebar"
import { useAdminData, AdminDataProvider } from "@/lib/AdminDataContext"
import GlobalSync from "@/components/GlobalSync";

export default function DashboardLayout({
children
}:{children:ReactNode}){

return(

<AdminDataProvider>

      <GlobalSync />

<div className="flex min-h-screen">

<Sidebar/>

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center pt-20">

{children}

</div>

</div>

</AdminDataProvider>

)

}