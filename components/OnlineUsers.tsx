"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function OnlineUsers() {

  const [users,setUsers] = useState<any[]>([])



  useEffect(()=>{

    const channel = supabase.channel("online-users",{
      config:{
        presence:{ key:"user" }
      }
    })



    channel.on("presence",{ event:"sync" },()=>{

      const state = channel.presenceState()

      const online = Object.values(state).flat()

      setUsers(online)

    })



    channel.subscribe(async(status)=>{

      if(status==="SUBSCRIBED"){

        const { data } = await supabase.auth.getUser()

        const user = data.user

        if(user){

          const username = user.email?.split("@")[0]

          channel.track({
            user_id:user.id,
            username
          })

        }

      }

    })



    return ()=>{
      supabase.removeChannel(channel)
    }

  },[])



  return(

  <div className="space-y-2">

  {users.map((u:any,i:number)=>(

  <div key={i} className="flex items-center gap-2">

  <div className="w-2 h-2 bg-green-400 rounded-full" />

  <span className="text-gray-700 text-sm">
  {u.username}
  </span>

  </div>

  ))}



  {users.length===0 && (

  <div className="text-gray-400 text-sm">
  No users online
  </div>

  )}

  </div>

  )

}