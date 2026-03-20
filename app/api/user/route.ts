import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 IMPORTANT
)

export async function GET(){

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      employees (
        name
      ),
      roles (
        name
      )
    `)

  if(error){
    console.error(error)
    return NextResponse.json({ users: [] })
  }

  const users = (data || []).map((u:any) => {

    const employee = Array.isArray(u.employees)
      ? u.employees[0]
      : u.employees

    const role = Array.isArray(u.roles)
      ? u.roles[0]
      : u.roles

    return {
      id: u.id,
      username: u.username,
      employee_name: employee?.name ?? null,
      role_name: role?.name ?? null
    }

  })

  return NextResponse.json({ users })
}