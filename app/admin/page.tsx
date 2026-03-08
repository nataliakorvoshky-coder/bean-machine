"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {

  const [users, setUsers] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [loading, setLoading] = useState(true)


  async function loadUsers(){

    const res = await fetch("/api/admin/list-users")
    const data = await res.json()

    setUsers(data.users || [])
  }


  async function createUser(){

    const res = await fetch("/api/admin/create-user",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    })

    const data = await res.json()

    if(data.error){
      setMessage(data.error)
    } else{
      setMessage("User created successfully")
      setEmail("")
      setPassword("")
      loadUsers()
    }
  }


  async function deleteUser(id:string){

    if(!id){
      alert("Select a user first")
      return
    }

    const confirmed = confirm("Delete this user?")
    if(!confirmed) return

    await fetch("/api/admin/delete-user",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id})
    })

    setSelectedUser("")
    loadUsers()
  }


  function logout(){

    document.cookie =
      "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"

    window.location.href="/"
  }


  useEffect(()=>{

    async function checkAdmin(){

      const { data:{user} } = await supabase.auth.getUser()

     if (!user) {
  window.location.href="/login"
}

      const res = await fetch(`/api/admin/check-admin?userId=${user.id}`)
      const data = await res.json()

    if (!data.admin) {
  window.location.href="/login"
}

      setLoading(false)
    }

    checkAdmin()
    loadUsers()

  },[])


  if(loading){
    return(
      <div className="flex justify-center items-center h-screen text-xl">
        Checking permissions...
      </div>
    )
  }


  return(

    <main className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200">


      <div className="bg-emerald-700 shadow-md py-5 relative flex justify-center items-center">

        <h1 className="text-2xl font-bold text-white tracking-wide">
          Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="absolute right-8 text-white font-semibold hover:opacity-80"
        >
          Logout
        </button>

      </div>


      <div className="pt-20 pb-32">

        <div className="max-w-6xl mx-auto">

          <div className="flex justify-center gap-24">


            {/* CREATE USER */}

            <div className="w-[420px] bg-white p-10 rounded-2xl shadow-xl flex flex-col">

              <div className="flex items-center justify-center gap-4 mb-10 text-emerald-600 font-semibold">

                <div className="h-[2px] bg-emerald-500 w-24"></div>
                <span className="text-lg">Create User</span>
                <div className="h-[2px] bg-emerald-500 w-24"></div>

              </div>


              <div className="space-y-8 flex-grow">

                <div>

                  <label className="block text-emerald-700 font-semibold mb-2">
                    Email
                  </label>

                  <input
                    className="border border-emerald-400 p-3 w-full rounded-lg"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                  />

                </div>


                <div>

                  <label className="block text-emerald-700 font-semibold mb-2">
                    Temporary Password
                  </label>

                  <input
                    className="border border-emerald-400 p-3 w-full rounded-lg"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                  />

                </div>

              </div>


              <button
                className="bg-emerald-500 text-white p-3 rounded-lg w-full hover:bg-emerald-600 mt-8"
                onClick={createUser}
              >
                Create User
              </button>


              {message && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  {message}
                </p>
              )}

            </div>



            {/* CURRENT USERS */}

            <div className="w-[420px] bg-white p-10 rounded-2xl shadow-xl flex flex-col">

              <div className="flex items-center justify-center gap-4 mb-10 text-emerald-600 font-semibold">

                <div className="h-[2px] bg-emerald-500 w-16"></div>
                <span className="text-lg">Current Users ({users.length})</span>
                <div className="h-[2px] bg-emerald-500 w-16"></div>

              </div>


              <div className="space-y-8 flex-grow">

                <select
                  className="border border-emerald-400 p-3 w-full rounded-lg"
                  value={selectedUser}
                  onChange={(e)=>setSelectedUser(e.target.value)}
                >

                  <option value="">Select a user</option>

                  {users.map((u:any)=>(
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}

                </select>

              </div>


              <button
                className="bg-emerald-500 text-white p-3 rounded-lg w-full hover:bg-emerald-600 mt-8"
                onClick={()=>deleteUser(selectedUser)}
              >
                Delete Selected User
              </button>

            </div>


          </div>

        </div>

      </div>

    </main>
  )
}