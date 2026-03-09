"use client"

import { usePresence } from "@/lib/PresenceContext"
import { useUserData } from "@/lib/UserDataContext"

export default function OnlineUsers(){

 const presence = usePresence()
 const { users } = useUserData()

 const activeUsers = Object.values(presence)
  .flat()
  .map((p:any)=>p.user_id)

 return(

 <div className="bg-white p-8 rounded-xl shadow w-[420px]">

 <h2 className="font-semibold mb-6 text-emerald-700">
 Online Users
 </h2>

 <div className="space-y-3">

 {users
  .filter((u:any)=>activeUsers.includes(u.id))
  .map((u:any)=>(

 <div
 key={u.id}
 className="flex justify-between items-center border border-emerald-400 p-3 rounded-lg"
 >

 <span className="font-medium">
 {u.username ?? "User"}
 </span>

 <div className="flex items-center gap-2">

 <div className="w-3 h-3 rounded-full bg-green-400"/>

 <span className="text-sm text-gray-500">
 Active
 </span>

 </div>

 </div>

 ))}

 </div>

 </div>

 )

}