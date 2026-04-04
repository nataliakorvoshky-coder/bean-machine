"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function OnlineUsers(){

  const pathname = usePathname()

  const [onlineUsers,setOnlineUsers] = useState<any[]>([])
  const [previousPages, setPreviousPages] = useState<Record<string,string>>({})
  const [selfUser, setSelfUser] = useState<any | null>(null)
  const [justJoined, setJustJoined] = useState<Record<string,boolean>>({})

  function pageName(path:string){
    if(path.startsWith("/admin")) return "Admin Dashboard"
    if(path.includes("dashboard")) return "Dashboard"
    if(path.includes("employees")) return "Employees"
    if(path.includes("submit-hours")) return "Submit Hours"
    if(path.includes("inventory")) return "Stock Overview"
    return "Page"
  }

  // ✅ FAST + STABLE USER FETCH
  async function getInitialUser(userId:string, pathname:string){

    const [profileRes, employeeRes, roleRes] = await Promise.all([

      supabase
        .from("profiles")
        .select("username, role_id, employee_id")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("profiles")
        .select("employee_id")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("profiles")
        .select("role_id")
        .eq("id", userId)
        .maybeSingle()

    ])

    const profile = profileRes.data

    if(!profile) return null

    const [employeeData, roleData] = await Promise.all([

      profile.employee_id
        ? supabase.from("employees").select("name").eq("id", profile.employee_id).maybeSingle()
        : Promise.resolve({ data: null }),

      profile.role_id
        ? supabase.from("roles").select("name").eq("id", profile.role_id).maybeSingle()
        : Promise.resolve({ data: null })

    ])

    return {
      user_id: userId,
      page: pathname,
      name: employeeData.data?.name || profile.username || "User",
      role: roleData.data?.name || "No Role",
      last_active: Date.now()
    }
  }

  // ✅ TRACK USER (NO FLICKER)
  async function trackUser(channel:any, userId:string, pathname:string){

    const ACTIVITY_INTERVAL = 10000

    async function send(){

      const payload = await getInitialUser(userId, pathname)
      if(!payload) return

      // ✅ ONLY update if changed (prevents flicker)
      setSelfUser((prev: any)=>{
        if(prev?.name === payload.name && prev?.page === payload.page){
          return prev
        }
        return payload
      })

      await channel.track(payload)
    }

    send()
    const interval = setInterval(send, ACTIVITY_INTERVAL)

    return () => clearInterval(interval)
  }

  useEffect(()=>{

    let channel:RealtimeChannel

    async function start(){

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if(!user) return

      const userId = user.id

      // ⚡ INSTANT REAL USER (NO PLACEHOLDER)
      const initialUser = await getInitialUser(userId, pathname)
      if(initialUser) setSelfUser(initialUser)

      await supabase.removeAllChannels()

      channel = supabase.channel("online-users",{
        config:{
          presence:{ key:userId },
          broadcast:{ self:true }
        }
      })

      channel.on("presence",{ event:"sync" },()=>{

        const state = channel.presenceState()
        const list:any[] = []

        Object.values(state).forEach((entries:any)=>{
          entries.forEach((entry:any)=> list.push(entry))
        })

        const unique:any = {}
        list.forEach(u=> unique[u.user_id] = u)

        const users = Object.values(unique)

        setOnlineUsers(users)

        // ✅ JOIN ANIMATION (stable)
        setJustJoined(prev=>{
          const updated = { ...prev }

          users.forEach((u:any)=>{
            if(!prev[u.user_id]){
              updated[u.user_id] = true
              setTimeout(()=>{
                setJustJoined(p=>{
                  const copy = { ...p }
                  delete copy[u.user_id]
                  return copy
                })
              },800)
            }
          })

          return updated
        })

        // ✅ PAGE CHANGE (no flicker)
        setPreviousPages(prev=>{
          const updated = { ...prev }

          users.forEach((u:any)=>{
            if(prev[u.user_id] && prev[u.user_id] !== u.page){
              updated[u.user_id] = u.page + "__moving"
            } else {
              updated[u.user_id] = u.page
            }
          })

          return updated
        })
      })

      channel.subscribe((status)=>{
        if(status === "SUBSCRIBED"){
          trackUser(channel, userId, pathname)
        }
      })
    }

    start()

    return ()=>{
      if(channel){
        supabase.removeChannel(channel)
      }
    }

  },[pathname])

  // ✅ CLEAN MERGE (NO DUPES / NO JUMP)
  const mergedUsers = [...onlineUsers]

  if(selfUser){
    const index = mergedUsers.findIndex(u => u.user_id === selfUser.user_id)

    if(index === -1){
      mergedUsers.unshift(selfUser)
    } else {
      mergedUsers[index] = selfUser
    }
  }

  const now = Date.now()

  const filteredUsers = mergedUsers.filter(u=>{
    return now - (u.last_active || 0) < 60000
  })

  return(
    <div className="bg-white p-6 rounded-xl shadow h-[400px] flex flex-col">

      <h2 className="text-lg font-semibold text-emerald-700 mb-4">
        Online Users
      </h2>

      {filteredUsers.length === 0 ? null : (

        <div className="overflow-y-auto flex-1 pr-2 scrollbar-hide space-y-3">

          {filteredUsers.map((u:any)=>{

            const idle = Date.now() - (u.last_active || 0) > 20000

            return(
              <div
                key={u.user_id}
                className={`flex justify-between items-center border border-emerald-300 p-3 rounded-lg transition-all duration-300
                ${justJoined[u.user_id] ? "animate-bounceIn" : "animate-fadeIn"}
                `}
              >

                <div className="flex items-center gap-3">

                  <div className={`w-2.5 h-2.5 rounded-full ${
                    previousPages[u.user_id]?.includes("__moving")
                      ? "bg-blue-400 animate-pulse"
                      : idle
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-green-500"
                  }`} />

                  <span className="font-medium text-emerald-700">
                    {u.name}
                  </span>

                </div>

                <div className="flex gap-3 text-xs">

                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-medium">
                    {u.role}
                  </span>

                  <span className={`px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium ${
                    previousPages[u.user_id]?.includes("__moving")
                      ? "animate-pulse"
                      : ""
                  }`}>
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