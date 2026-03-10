"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

  const router = useRouter()

  useEffect(()=>{

    async function check(){

      const { data:userData } = await supabase.auth.getUser()
      const user = userData?.user

      if(!user){
        router.replace("/")
        return
      }

      /* GET ROLE */

      const { data:roleRow } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id",user.id)
        .single()

      if(!roleRow){
        return
      }

      const { data:role } = await supabase
        .from("roles")
        .select("name")
        .eq("id",roleRow.role_id)
        .single()

      const roleName = role?.name

      /* ADMIN ALWAYS ALLOWED */

      if(roleName === "admin"){
        return
      }

      /* CHECK PAGE PERMISSIONS */

      const { data:perm } = await supabase
        .from("permissions")
        .select("can_view")
        .eq("role_id",roleRow.role_id)
        .eq("page",page)
        .single()

      if(!perm?.can_view){
        router.replace("/dashboard")
      }

    }

    check()

  },[page,router])

}