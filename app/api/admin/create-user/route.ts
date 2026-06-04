import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

   const { email, password, userId, employee_id } = await req.json()

    // ✅ VALIDATION
    if (!email || !password || !employee_id) {
      return NextResponse.json(
        { error: "Email, password, and employee are required" },
        { status: 400 }
      )
    }

    // ✅ ADMIN CHECK
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // 🔥 PREVENT duplicate employee accounts
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("employee_id", employee_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "This employee already has an account" },
        { status: 400 }
      )
    }

    // ✅ GET EMPLOYEE RANK LEVEL
const { data: employee } = await supabaseAdmin
  .from("employees")
  .select("rank:rank_id (rank_level)")
  .eq("id", employee_id)
  .single()

if (!employee) {
  return NextResponse.json(
    { error: "Employee not found" },
    { status: 400 }
  )
}

// ✅ MAP RANK → ROLE
let roleName = "employee"

if (employee.rank?.[0]?.rank_level === 999) {
  roleName = "admin"
} else if (employee.rank?.[0]?.rank_level >= 8) {
  roleName = "manager"
} else if (employee.rank?.[0]?.rank_level>= 7) {
  roleName = "supervisor"
}

// ✅ GET ROLE ID
const { data: role } = await supabaseAdmin
  .from("roles")
  .select("id")
  .eq("name", roleName)
  .single()

if (!role) {
  return NextResponse.json(
    { error: "Role not found" },
    { status: 500 }
  )
}


    // ✅ CREATE AUTH USER
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const newUser = data.user
    const username = email.split("@")[0]

    // ✅ CREATE PROFILE
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
.insert({
  id: newUser.id,
  username,
  employee_id,
  role_id: role.id
})

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: newUser
    })

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}