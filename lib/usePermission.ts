"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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
        .select(`
          roles (
            name
          )
        `)
        .eq("user_id", user.id)
        .single()

      /* roles comes back as array */

      const role = roleData?.roles?.[0]?.name

      if (!role) {
        router.replace("/dashboard")
        return
      }

      /* admin can access everything */

      if (role === "admin") return

      const rolePermissions: Record<string,string[]> = {

        manager: ["dashboard","employees","settings"],

        supervisor: ["dashboard","employees","settings"],

        employee: ["dashboard","settings"]

      }

      const allowed = rolePermissions[role]?.includes(page)

      if (!allowed) {
        router.replace("/dashboard")
      }

    }

    checkPermission()

  }, [page, router])

}