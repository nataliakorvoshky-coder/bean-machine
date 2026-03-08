"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function OnlineUsers(){

 const [users,setUsers] = useState<any[]>([])



 useEffect(()=>{

  async function loadUsers(){

   const { data } = await supabase
    .from("profiles")
    .select("username")

   if(data){
    setUsers(data)
   }

  }

  loadUsers()



  const channel = supabase.channel("online-users")

  channel
   .on("presence", { event: "sync" }, () => {

    const state = channel.presenceState()

    const onlineUsers = Object.values(state)
     .flat()
     .map((p:any)=>p.username)

    setUsers(onlineUsers.map((u)=>({username:u})))

   })
   .subscribe(async (status) => {

    if(status === "SUBSCRIBED"){

     const { data } = await supabase.auth.getUser()

     if(data.user){

      const { data: profile } = await supabase
       .from("profiles")
       .select("username")
       .eq("id", data.user.id)
       .single()

      channel.track({
       username: profile?.username || "User"
      })

     }

    }

   })



  return () => {
   supabase.removeChannel(channel)
  }

 },[])



 return(

 <div className="bg-white rounded-xl shadow p-6 w-[420px]">

 <h2 className="text-lg font-semibold text-emerald-700 mb-4">
 Online Users
 </h2>

 <div className="space-y-2">

 {users.map((u:any,i:number)=>(
  <div key={i} className="flex items-center gap-2">

   <div className="w-2 h-2 bg-green-400 rounded-full"/>

   <span>{u.username}</span>

  </div>
 ))}

 </div>

 </div>

 )

}