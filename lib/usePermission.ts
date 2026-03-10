"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page: string){

  const router = useRouter()

  useEffect(()=>{

    async function check(){

      const { data:userData } = await supabase.auth.getUser()
      const user = userData?.user

      if(!user){
        router.replace("/")
        return
      }

      const { data } = await supabase
        .from("user_roles")
        .select(`
          roles(
            permissions(
              page,
              can_view
            )
          )
        `)
        .eq("user_id",user.id)
        .single()

      /* roles returns as array */

      const permissions =
        data?.roles?.[0]?.permissions || []

      const allowed = permissions.find(
        (p:any)=>p.page===page
      )

      if(!allowed?.can_view){
        router.replace("/dashboard")
      }

    }

    check()

  },[page,router])

}