"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import OnlineUsers from "@/components/OnlineUsers"
import ActivityFeed from "@/components/ActivityFeed"

export default function Dashboard(){

 const [user,setUser] = useState<any>(null)
 const router = useRouter()



 useEffect(()=>{

  const getUser = async ()=>{

   const { data } = await supabase.auth.getUser()

   if(!data.user){
    router.push("/")
   }else{
    setUser(data.user)
   }

  }

  getUser()

 },[])



 const logout = async ()=>{

  await supabase.auth.signOut()
  router.push("/")

 }



 return(

 <main className="w-full">

 {/* PAGE HEADER */}

 <div className="mb-10">

 <h1 className="text-2xl font-bold text-emerald-700">
 Dashboard
 </h1>

 {user && (
 <p className="text-gray-600 mt-1">
 Logged in as: {user.email}
 </p>
 )}

 </div>



 {/* DASHBOARD PANELS */}

 <div className="grid grid-cols-2 gap-8 max-w-5xl">

 <OnlineUsers />

 <ActivityFeed />

 </div>



 {/* LOGOUT */}

 <div className="mt-10">

 <button
 onClick={logout}
 className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition"
 >
 Logout
 </button>

 </div>

 </main>

 )

}