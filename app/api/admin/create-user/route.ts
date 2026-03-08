import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ADMIN_EMAIL } from "@/lib/admin"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { email, password, userEmail } = await req.json()

  if (userEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  return NextResponse.json({ success: true, user: data.user })
}