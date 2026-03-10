"use client"

import { usePermission } from "@/lib/usePermission"
import OnlineUsers from "@/components/OnlineUsers"
import ActivityFeed from "@/components/ActivityFeed"

export default function AdminPage(){

usePermission("admin")

return(

<div className="w-[1000px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Admin Dashboard
</h1>

<div className="flex gap-12">

<OnlineUsers/>

<ActivityFeed/>

</div>

</div>

)

}