"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page: string) {

  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {

    async function checkPermission() {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        router.replace("/")
        return
      }

      /* get role */

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!roleData) {
        router.replace("/dashboard")
        return
      }

      /* admin bypass (prevents lockout forever) */

      const { data: roleName } = await supabase
        .from("roles")
        .select("name")
        .eq("id", roleData.role_id)
        .maybeSingle()

      if (roleName?.name === "admin") {
        setChecked(true)
        return
      }

      /* permission check */

      const { data: permissions } = await supabase
        .from("permissions")
        .select("page,can_view")
        .eq("role_id", roleData.role_id)

      const allowed = permissions?.find((p: any) => p.page === page)

      if (!allowed?.can_view) {
        router.replace("/dashboard")
      }

      setChecked(true)
    }

    checkPermission()

  }, [page])

  return checked
}