"use client"

import OnlineUsers from "@/components/OnlineUsers"
import ActivityFeed from "@/components/ActivityFeed"
import { usePermission } from "@/lib/usePermission"

export default function DashboardPage(){

const ready = usePermission("dashboard")

/* wait for permission check */

if(!ready){
return null
}

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Dashboard
</h1>

<div className="grid grid-cols-2 gap-8">

<OnlineUsers/>

<ActivityFeed/>

</div>

</div>

)

}