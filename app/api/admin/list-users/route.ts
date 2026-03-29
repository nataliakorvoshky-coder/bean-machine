import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

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

    const users = (data || []).map((u: any) => ({
      id: u.id,
      username: u.username,
      disabled: u.disabled,
      employee_name: u.employees?.name || null,
      role_name: u.roles?.name || null
    }))

    return NextResponse.json({ users })

  } catch (err) {
    return NextResponse.json({ users: [] })
  }
}