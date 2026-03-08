"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {

  const [users, setUsers] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)



  async function loadUsers() {

    const res = await fetch("/api/admin/list-users", {
      method:"POST"
    })

    const data = await res.json()

    setUsers(data.users || [])
  }



  async function createUser() {

    const { data } = await supabase.auth.getUser()

    const res = await fetch("/api/admin/create-user", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        email,
        password,
        userId: data.user?.id
      })
    })

    const result = await res.json()

    if(result.error){
      setMessage(result.error)
    } else {
      setMessage("User created successfully")
      setEmail("")
      setPassword("")
      loadUsers()
    }

  }



  async function deleteUser(id:string){

    if(!id){
      alert("Please select a user")
      return
    }

    const confirmed = confirm("Delete this user?")
    if(!confirmed) return

    const { data } = await supabase.auth.getUser()

    await fetch("/api/admin/delete-user",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        id,
        userId: data.user?.id
      })
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

    async function init(){

      const { data } = await supabase.auth.getUser()

      const user = data.user

      if(!user){
        window.location.href="/"
        return
      }

      const res = await fetch("/api/admin/check-admin",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          userId:user.id
        })
      })

      const result = await res.json()

      setIsAdmin(result.admin)

      loadUsers()

    }

    init()

  },[])



  return (

    <main className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200">


      {/* HEADER */}

      <div className="bg-emerald-700 shadow-md py-5 relative flex justify-center items-center">

        <h1 className="text-2xl font-bold text-white tracking-wide">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
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



            {/* CREATE USER PANEL */}

            {isAdmin && (

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
                      className="border border-emerald-400 p-3 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                    />

                  </div>


                  <div>

                    <label className="block text-emerald-700 font-semibold mb-2">
                      Temporary Password
                    </label>

                    <input
                      className="border border-emerald-400 p-3 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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

            )}



            {/* CURRENT USERS PANEL */}

            <div className="w-[420px] bg-white p-10 rounded-2xl shadow-xl flex flex-col">

              <div className="flex items-center justify-center gap-4 mb-10 text-emerald-600 font-semibold">

                <div className="h-[2px] bg-emerald-500 w-16"></div>

                <span className="text-lg">
                  Current Users ({users.length})
                </span>

                <div className="h-[2px] bg-emerald-500 w-16"></div>

              </div>


              <div className="space-y-8 flex-grow">

                <div>

                  <label className="block text-emerald-700 font-semibold mb-2">
                    Select User
                  </label>

                  <select
                    className="border border-emerald-400 p-3 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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

              </div>


              {isAdmin && (

                <button
                  className="bg-emerald-500 text-white p-3 rounded-lg w-full hover:bg-emerald-600 mt-8"
                  onClick={()=>deleteUser(selectedUser)}
                >
                  Delete Selected User
                </button>

              )}

            </div>



          </div>

        </div>

      </div>

    </main>

  )

}