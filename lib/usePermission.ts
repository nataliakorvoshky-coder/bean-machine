"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function usePermission(page: string) {

  const router = useRouter()

  useEffect(() => {

    async function check() {

      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        router.push("/")
        return
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!roleData) {
        router.push("/dashboard")
        return
      }

      const role = roleData.role

      // Admin has access to everything
      if (role === "admin") return

      // Simple page permission
      if (role !== page) {
        router.push("/dashboard")
      }

    }

    check()

  }, [])

}