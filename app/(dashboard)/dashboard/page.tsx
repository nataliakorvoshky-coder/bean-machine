"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Dashboard(){

 const [users,setUsers] = useState<any[]>([])
 const [presence,setPresence] = useState<any>({})
 const [status,setStatus] = useState("active")



 async function loadUsers(){

  const res = await fetch("/api/admin/list-users")
  const data = await res.json()

  setUsers(data.users || [])

 }



 /* ACTIVITY / IDLE DETECTION */

 useEffect(()=>{

  let idleTimer:any

  function setActive(){

   setStatus("active")

   clearTimeout(idleTimer)

   idleTimer = setTimeout(()=>{
    setStatus("idle")
   },60000)

  }

  window.addEventListener("mousemove",setActive)
  window.addEventListener("keydown",setActive)

  setActive()

  return ()=>{
   window.removeEventListener("mousemove",setActive)
   window.removeEventListener("keydown",setActive)
  }

 },[])



 /* REALTIME PRESENCE */

 useEffect(()=>{

  let channel:any

  async function startPresence(){

   const { data } = await supabase.auth.getUser()
   const user = data.user

   if(!user) return

   channel = supabase.channel("online-users",{
    config:{
     presence:{ key:user.id }
    }
   })

   channel
    .on("presence",{event:"sync"},()=>{
     const state = channel.presenceState()
     setPresence(state)
    })
    .subscribe(async(statusResp:any)=>{

     if(statusResp==="SUBSCRIBED"){

      await channel.track({
       user:user.id,
       status
      })

     }

    })

  }

  startPresence()
  loadUsers()

  return ()=>{
   if(channel){
    supabase.removeChannel(channel)
   }
  }

 },[status])



 return(

 <div className="w-[1000px]">

 <h1 className="text-3xl font-bold text-emerald-700 mb-10">
 Dashboard
 </h1>



 <div className="flex gap-12">



 {/* ONLINE USERS */}

 <div className="w-[420px] bg-white p-8 rounded-xl shadow">

 <h2 className="font-semibold mb-6 text-emerald-700">
  Online Users
 </h2>

 <div className="space-y-3">

 {users.map((u:any)=>{

  const state = presence[u.id]

  let color="bg-gray-400"
  let text="Offline"

  if(state){

   const userState = state[0]?.status

   if(userState==="active"){
    color="bg-green-400"
    text="Active"
   }

   if(userState==="idle"){
    color="bg-yellow-400"
    text="Idle"
   }

  }

  return(

  <div
   key={u.id}
   className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
  >

<span className="font-medium">
 {u.username || "User"}
</span>

  <div className="flex items-center gap-2">

  <div className={`w-3 h-3 rounded-full ${color}`} />

  <span className="text-sm text-gray-500">
  {text}
  </span>

  </div>

  </div>

  )

 })}

 </div>

 </div>



 {/* ACTIVITY FEED */}

 <div className="w-[420px] bg-white p-8 rounded-xl shadow">

 <h2 className="font-semibold mb-6 text-emerald-700">
  Activity Feed
 </h2>

 <p className="text-gray-500">
  No activity yet
 </p>

 </div>



 </div>

 </div>

 )

}