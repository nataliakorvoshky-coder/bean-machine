import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

type LogParams = {
  action: string
  type: string
  userId?: string
  employeeName?: string
  username?: string
  details?: any
}

export async function logActivity({
  action,
  type,
  userId,
  employeeName,
  username: providedUsername,
  details,
}: LogParams) {

  try {

    let username = providedUsername || "system"

    // 🔥 lookup username from profile if userId exists
const { data } = await supabase

  .from("profiles")

  .select(`
    username,
    employee_id
  `)

  .eq(
    "username",
    username
  )

  .maybeSingle()

if (
  data?.employee_id
) {

  const {
    data: employee
  } = await supabase

    .from("employees")

    .select("name")

    .eq(
      "id",
      data.employee_id
    )

    .maybeSingle()

  if (
    employee?.name
  ) {
    employeeName =
      employee.name
  }
}

    // 🔥 DEBUG
    console.log("🔥 INSERTING ACTIVITY:", {
      username,
      action,
      type,
      user_id: userId || null,
      employee_name: employeeName || null,
    })

    console.log(
  "FINAL EMPLOYEE:",
  employeeName
)

console.log(
  "FINAL USERNAME:",
  username
)

    const { error } = await supabase
      .from("activity_log")
      .insert({
        username,
        action,
        type,
        user_id: userId || null,
        employee_name: employeeName || null,
        details:
  details || null,
      })

    // 🔥 THROW REAL ERROR
    if (error) {

      console.error("❌ FULL ACTIVITY INSERT ERROR:", error)

      throw error
    }

    console.log("✅ ACTIVITY INSERT SUCCESS")

  } catch (err) {

    console.error("❌ Activity log failed:", err)
  }
}