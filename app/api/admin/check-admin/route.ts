import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return Response.json({ admin:false })
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", userId)
    .single()

  return Response.json({
    admin: data?.role === "admin"
  })
}