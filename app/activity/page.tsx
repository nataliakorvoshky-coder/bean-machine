"use client"

import { useEffect,useState } from "react"

export default function ActivityPage(){

 const [logs,setLogs] = useState<any[]>([])
 const [search,setSearch] = useState("")

 async function loadLogs(){

  let url = "/api/activity"

  if(search){
   url += `?username=${search}`
  }

  const res = await fetch(url)
  const data = await res.json()

  setLogs(data.logs || [])

 }

 useEffect(()=>{
  loadLogs()
 },[])



 return(

 <main className="min-h-screen bg-gray-100 flex">

 {/* SIDEBAR */}

 <div className="w-64 bg-emerald-700 text-white flex flex-col p-6">

 <h2 className="text-xl font-bold mb-10">
 Bean Machine
 </h2>

 <nav className="flex flex-col gap-4">

 <button
 onClick={()=>window.location.href="/admin"}
 className="text-left hover:opacity-80"
 >
 Dashboard
 </button>

 <button
 onClick={()=>window.location.href="/activity"}
 className="text-left hover:opacity-80"
 >
 Activity
 </button>

 <button
 onClick={()=>window.location.href="/settings"}
 className="text-left hover:opacity-80"
 >
 Settings
 </button>

 <button
 onClick={()=>window.location.href="/"}
 className="text-left hover:opacity-80 mt-10"
 >
 Logout
 </button>

 </nav>

 </div>



 {/* ACTIVITY CONTENT */}

 <div className="flex-1 p-10">

 <h1 className="text-2xl font-bold text-emerald-700 mb-6">
 User Activity
 </h1>


 {/* SEARCH */}

 <div className="mb-6">

 <input
 placeholder="Search by username..."
 value={search}
 onChange={(e)=>setSearch(e.target.value)}
 className="border border-emerald-400 p-3 rounded w-[300px]"
 />

 <button
 onClick={loadLogs}
 className="ml-3 bg-emerald-500 text-white px-4 py-3 rounded"
 >
 Search
 </button>

 </div>



 {/* ACTIVITY LIST */}

 <div className="bg-white rounded-xl shadow p-6 space-y-4">

 {logs.map((log:any)=>(

 <div
 key={log.id}
 className="border-b pb-3"
 >

 <div className="font-medium">
 {log.username}
 </div>

 <div className="text-sm text-gray-600">
 {log.action}
 </div>

 <div className="text-xs text-gray-400">
 {new Date(log.created_at).toLocaleString()}
 </div>

 </div>

 ))}

 </div>

 </div>

 </main>

 )

}