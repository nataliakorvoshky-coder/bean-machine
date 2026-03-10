"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function usePermission(page: string) {

  const router = useRouter()

  useEffect(() => {

    async function checkPermission() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        router.replace("/")
        return
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!roleData) {
        router.replace("/dashboard")
        return
      }

      const role = roleData.role

      // Admin always allowed
      if (role === "admin") return

      // Basic page permissions
      if (page !== role) {
        router.replace("/dashboard")
      }

    }

    checkPermission()

  }, [page, router])

}