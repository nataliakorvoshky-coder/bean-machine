"use client"

import { useEffect,useState } from "react"
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

 <main className="p-10">

 <h1 className="text-2xl font-bold text-emerald-700 mb-4">
 Dashboard
 </h1>

 {user && (
 <p className="mb-8 text-gray-700">
 Logged in as: {user.email}
 </p>
 )}



 {/* DASHBOARD GRID */}

 <div className="grid grid-cols-2 gap-8">

 <OnlineUsers />

 <ActivityFeed />

 </div>



 <button
 onClick={logout}
 className="mt-10 bg-emerald-500 text-white px-5 py-3 rounded hover:bg-emerald-600"
 >
 Logout
 </button>

 </main>

 )

}