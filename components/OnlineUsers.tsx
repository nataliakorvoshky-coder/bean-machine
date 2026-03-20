"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

  const pathname = usePathname()
  const [onlineUsers,setOnlineUsers] = useState<any[]>([])

  function pageName(path:string){
    if(path.startsWith("/admin")) return "Admin Dashboard"
    if(path.includes("dashboard")) return "Dashboard"
    if(path.includes("employees")) return "Employees"
    if(path.includes("submit-hours")) return "Submit Hours"
    if(path.includes("inventory")) return "Stock Overview"
    if(path.includes("restock")) return "Restocking"
    if(path.includes("profile")) return "Profile"
    if(path.includes("settings")) return "Settings"
    return "Page"
  }

  // 🔥 TRACK USER (FIXED + DEBUGGED)
  async function trackUser(channel:any, userId:string, pathname:string){

    const ACTIVITY_INTERVAL = 10000

    async function send(){

      // ✅ PROFILE
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, role_id, employee_id")
        .eq("id", userId)
        .maybeSingle()

      if (profileError || !profileData) {
        console.error("PROFILE ERROR:", profileError)
        return
      }

      // ✅ EMPLOYEE
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("name")
        .eq("id", profileData.employee_id)
        .maybeSingle()

      if (employeeError) {
        console.error("EMPLOYEE ERROR:", employeeError)
      }

      // ✅ ROLE
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("name")
        .eq("id", profileData.role_id)
        .maybeSingle()

      if (roleError) {
        console.error("ROLE ERROR:", roleError)
      }

      // 🔥 DEBUG (CHECK CONSOLE)
      console.log("DEBUG ROLE:", {
        role_id: profileData.role_id,
        roleData
      })

      await channel.track({
        user_id: userId,
        page: pathname,
        name: employeeData?.name || profileData.username || "User",
        role: roleData?.name || "No Role",
        last_active: Date.now()
      })
    }

    await send()

    const interval = setInterval(send, ACTIVITY_INTERVAL)

    return () => clearInterval(interval)
  }

  useEffect(()=>{

    let channel:RealtimeChannel
    let cleanupActivity:any

    async function start(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user) return

      const userId = user.id

      // 🔥 RESET CHANNELS (prevents ghost users)
      await supabase.removeAllChannels()

      channel = supabase.channel("online-users",{
        config:{
          presence:{ key:userId },
          broadcast:{ self:true }
        }
      })

      // ✅ LISTEN FOR USERS
      channel.on("presence",{ event:"sync" },()=>{

        const state = channel.presenceState()
        const list:any[] = []

        Object.values(state).forEach((entries:any)=>{
          entries.forEach((entry:any)=> list.push(entry))
        })

        // 🔥 DEDUPE
        const unique:any = {}
        list.forEach(u=>{
          unique[u.user_id] = u
        })

        setOnlineUsers(Object.values(unique))
      })

      // 🔥 CRITICAL: WAIT FOR SUBSCRIBE
      channel.subscribe(async (status)=>{

        if(status === "SUBSCRIBED"){
          cleanupActivity = await trackUser(channel, userId, pathname)
        }

      })
    }

    start()

    return ()=>{
      if(channel){
        supabase.removeChannel(channel)
      }
      cleanupActivity?.()
    }

  },[pathname])

  // 🔥 REMOVE OFFLINE USERS (60s timeout)
  const now = Date.now()

  const filteredUsers = onlineUsers.filter(u=>{
    const last = u.last_active || 0
    return now - last < 60000
  })

  return(

    <div className="bg-white p-6 rounded-xl shadow h-[400px] flex flex-col">

      <h2 className="text-lg font-semibold text-emerald-700 mb-4">
        Online Users
      </h2>

      {filteredUsers.length === 0 ?(

        <div className="text-gray-500 text-sm">
          No users online
        </div>

      ):( 

        <div className="overflow-y-auto flex-1 pr-2 scrollbar-hide space-y-3">

          {filteredUsers.map((u:any,index:number)=>{

            const displayName = u.name || "User"
            const roleName = u.role || "No Role"

            const idleSeconds = (Date.now() - (u.last_active || 0)) / 1000
            const isIdle = idleSeconds > 20

            const key = `${u.user_id}-${index}`

            return(

              <div
                key={key}
                className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
              >

                {/* LEFT */}
                <div className="flex items-center gap-3">

                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isIdle ? "bg-yellow-400" : "bg-green-500"
                  }`}></div>

                  <span className="font-medium text-emerald-700">
                    {displayName}
                  </span>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6 text-sm">

                  <span className="text-emerald-700">
                    {roleName}
                  </span>

                  <span className="text-emerald-700 italic">
                    {pageName(u.page)}
                  </span>

                </div>

              </div>

            )

          })}

        </div>

      )}

    </div>

  )

}