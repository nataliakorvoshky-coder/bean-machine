import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { email, password, userId, employee_id, role_id } = await req.json()

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

    // ✅ GET DEFAULT ROLE
    let finalRoleId = role_id

    if (!finalRoleId) {
      const { data: defaultRole } = await supabaseAdmin
        .from("roles")
        .select("id")
        .eq("name", "employee")
        .maybeSingle()

      finalRoleId = defaultRole?.id
    }

    // 🔥 VALIDATE ROLE
    const { data: roleCheck } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("id", finalRoleId)
      .maybeSingle()

    if (!roleCheck) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
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
        role_id: finalRoleId
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