import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      disabled,
      employee_id,
      role_id,
      employees ( name ),
      roles ( name )
    `)
    .order("username")

  if (error) {
    console.error(error)
    return NextResponse.json({ users: [] })
  }

  // 🔥 FORMAT CLEAN DATA
  const users = (data || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    disabled: u.disabled,

    // ✅ WHAT ONLINE USERS NEED
    employee_name: u.employees?.name || null,
    role_name: u.roles?.name || null
  }))

  return NextResponse.json({ users })
}