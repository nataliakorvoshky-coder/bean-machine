"use client"

import { useState, useEffect } from "react"
import { useAdminData } from "@/lib/AdminDataContext"
import StyledDropdown from "@/components/StyledDropdown"
import OnlineUsers from "@/components/OnlineUsers"
import { motion } from "framer-motion"

export default function AdminPage(){

  const { load } = useAdminData()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [employeeId,setEmployeeId] = useState("")
  const [roleId,setRoleId] = useState("")

  const [employees,setEmployees] = useState<any[]>([])
  const [roles,setRoles] = useState<any[]>([])

  const [loading,setLoading] = useState(false)

  useEffect(() => {
    loadEmployees()
    loadRoles()
  }, [])

  async function loadEmployees(){
    try {
      const res = await fetch("/api/employees")
      const data = await res.json()

      setEmployees(
        Array.isArray(data)
          ? data
          : data?.employees || []
      )

    } catch (err) {
      console.error("Failed to load employees:", err)
      setEmployees([])
    }
  }

  async function loadRoles(){
    try {
      const res = await fetch("/api/roles")

      if (!res.ok) throw new Error("Failed to fetch roles")

      const data = await res.json()

      setRoles(
        Array.isArray(data)
          ? data
          : data?.roles || []
      )

    } catch (err) {
      console.error("Failed to load roles:", err)
      setRoles([])
    }
  }

  async function createUser(){

    if(loading) return

    if(!email || !password){
      alert("Email and password required")
      return
    }

    if(!employeeId){
      alert("Please select an employee")
      return
    }

    if(!roleId){
      alert("Please select a role")
      return
    }

    setLoading(true)

    try {

      const userRes = await fetch("/api/auth/me")
      const userData = await userRes.json()

      if(!userData?.user){
        alert("Not authenticated")
        setLoading(false)
        return
      }

      const res = await fetch("/api/admin/create-user",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          email,
          password,
          userId: userData.user.id,
          employee_id: employeeId,
          role_id: roleId
        })
      })

      const data = await res.json()

      if(data.error){
        alert(data.error)
        setLoading(false)
        return
      }

      setEmail("")
      setPassword("")
      setEmployeeId("")
      setRoleId("")

      await load()

    } catch (err) {
      console.error(err)
      alert("Error creating user")
    }

    setLoading(false)
  }

  return(

    <motion.div
  className="w-[1100px]"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Admin Dashboard
      </h1>

      <motion.div
  className="grid grid-cols-2 gap-8"
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  }}
>

        <motion.div
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4 }}
>
  <OnlineUsers />
</motion.div>

        <motion.div
  className="bg-white p-8 rounded-xl shadow"
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4 }}
>

          <h2 className="text-lg font-semibold text-emerald-700 mb-6">
            Create User
          </h2>

          <div className="flex flex-col gap-4">

            {/* EMAIL */}
            <input
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              disabled={loading}
              className="border border-emerald-300 rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              disabled={loading}
              className="border border-emerald-300 rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            {/* EMPLOYEE + ROLE */}
            <div className="grid grid-cols-2 gap-4">

              <div className="flex flex-col">
                <label className="text-xs text-emerald-700 font-semibold mb-1">
                  Employee
                </label>
                <StyledDropdown
                  value={employeeId}
                  onChange={setEmployeeId}
                  placeholder="Select Employee"
                  options={employees.map((e:any)=>({
                    id: e.id,
                    name: e.name
                  }))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-700 font-semibold mb-1">
                  Role
                </label>
                <StyledDropdown
                  value={roleId}
                  onChange={setRoleId}
                  placeholder="Select Role"
                  options={roles.map((r:any)=>({
                    id: r.id,
                    name: r.name
                  }))}
                />
              </div>

            </div>

            <button
              onClick={createUser}
              disabled={loading}
              className={`px-5 py-2 rounded w-fit text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </button>

          </div>

        </motion.div>

      </motion.div>

    </motion.div>

  )
}