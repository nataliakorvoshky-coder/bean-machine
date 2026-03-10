"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

  const router = useRouter()

  useEffect(()=>{

    async function checkPermission(){

      const { data:userData } = await supabase.auth.getUser()
      const user = userData?.user

      if(!user){
        router.replace("/")
        return
      }

      const { data:roleData, error } = await supabase
        .from("user_roles")
        .select(`
          roles(
            name
          )
        `)
        .eq("user_id",user.id)
        .single()

      if(error || !roleData){
        return
      }

      const role = roleData.roles?.[0]?.name

      if(!role){
        return
      }

      /* ADMIN ACCESS */

      if(role === "admin"){
        return
      }

      /* PERMISSIONS MAP */

      const permissions:Record<string,string[]> = {

        manager:["dashboard","employees","settings"],

        supervisor:["dashboard","employees","settings"],

        employee:["dashboard","settings"]

      }

      const allowed = permissions[role]?.includes(page)

      if(!allowed){
        router.replace("/dashboard")
      }

    }

    checkPermission()

  },[page,router])

}