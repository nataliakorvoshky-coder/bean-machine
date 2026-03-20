"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"

type ContextType = {
  users:any[]
  roles:any[]
  permissions:any[]
  username:string
  loading:boolean
  load:()=>Promise<void>
}

const AdminContext = createContext<ContextType | null>(null)

export function AdminDataProvider({children}:{children:React.ReactNode}){

  const [users,setUsers] = useState<any[]>([])
  const [roles,setRoles] = useState<any[]>([])
  const [permissions,setPermissions] = useState<any[]>([])
  const [username,setUsername] = useState("")
  const [loading,setLoading] = useState(true)

  async function load(){

    setLoading(true)

    try {

      // 🔥 USERS FROM API
      const res = await fetch("/api/user")

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const data = await res.json()
      console.log("API USERS:", data.users)

      setUsers(data.users || [])

      // ✅ roles
      const { data:rolesData } = await supabase
        .from("roles")
        .select("*")

      setRoles(rolesData || [])

      // ✅ permissions
      const { data:permData } = await supabase
        .from("role_permissions")
        .select("*")

      setPermissions(permData || [])

      // 🔐 username
      const { data:auth } = await supabase.auth.getUser()
      const user = auth?.user

      if(user){
        const { data:profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id",user.id)
          .maybeSingle()

        if(profile?.username){
          setUsername(profile.username)
        }
      }

    } catch (err) {
      console.error("LOAD ERROR:", err)
      setUsers([])
    } finally {
      // 🔥 ALWAYS RUNS
      setLoading(false)
    }

  }

  useEffect(()=>{

    load().catch(console.error)

    const channel = supabase
      .channel("profiles-live")
      .on(
        "postgres_changes",
        { event:"*", schema:"public", table:"profiles" },
        () => load()
      )
      .subscribe()

    return ()=>{
      supabase.removeChannel(channel)
    }

  },[])

  return(
    <AdminContext.Provider
      value={{
        users,
        roles,
        permissions,
        username,
        loading,
        load
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminData(){
  const ctx = useContext(AdminContext)
  if(!ctx){
    throw new Error("useAdminData must be used inside AdminDataProvider")
  }
  return ctx
}