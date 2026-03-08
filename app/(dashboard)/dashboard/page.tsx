"use client"

import OnlineUsers from "@/components/OnlineUsers"
import ActivityFeed from "@/components/ActivityFeed"

export default function Dashboard(){

return(

<main className="flex justify-center pt-20 w-full">

<div className="max-w-6xl w-full">

{/* PAGE TITLE */}

<h1 className="text-xl font-bold text-emerald-700 mb-10">
Dashboard
</h1>


{/* PANELS */}

<div className="grid grid-cols-2 gap-8">


{/* ONLINE USERS PANEL */}

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Online Users
</h2>

<OnlineUsers/>

</div>



{/* ACTIVITY PANEL */}

<div className="bg-white p-8 rounded-xl shadow">

<h2 className="text-lg font-semibold text-emerald-700 mb-6">
Activity Feed
</h2>

<ActivityFeed/>

</div>


</div>

</div>

</main>

)

}