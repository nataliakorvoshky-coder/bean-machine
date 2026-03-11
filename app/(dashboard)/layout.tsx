import { ReactNode } from "react"
import Sidebar from "@/components/Sidebar"
import { AdminDataProvider } from "@/lib/AdminDataContext"

export default function DashboardLayout({
children
}:{children:ReactNode}){

return(

<AdminDataProvider>

<div className="flex min-h-screen">

<Sidebar/>

<div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center pt-20">

{children}

</div>

</div>

</AdminDataProvider>

)

}