import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const { email, password, userId } = await req.json()

    if (!email || !password) {
      return NextResponse.json({
        error: "Email and password required"
      })
    }

    // check if requester is admin
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (!admin) {
      return NextResponse.json({
        error: "Unauthorized"
      })
    }

    // create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      return NextResponse.json({
        error: error.message
      })
    }

    const newUser = data.user

    // generate default username
    const username = email.split("@")[0]

    // create profile row
    await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUser.id,
        username
      })

    return NextResponse.json({
      success: true,
      user: newUser
    })

  } catch (err) {

    return NextResponse.json({
      error: "Server error"
    })

  }

}