"use client"

import { usePermission } from "@/lib/usePermission"

export default function SettingsPage(){

usePermission("settings")

return(

<div className="w-[420px] bg-white p-10 rounded-xl shadow">

<h1 className="text-xl font-bold mb-6 text-emerald-700">
Account Settings
</h1>

<p className="text-gray-500">
Settings tools go here.
</p>

</div>

)

}