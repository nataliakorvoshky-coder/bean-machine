import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {
  try {

    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        role_id,
        employee_id,
        employees (
          id,
          name,
          status,
          weekly_hours,
          weekly_earnings,
          lifetime_hours,
          lifetime_earnings,
          employee_ranks (
            rank_name,
            wage,
            hours_required
          )
        )
      `)
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const emp = Array.isArray(data.employees)
      ? data.employees[0] ?? null
      : data.employees ?? null

    const rank = Array.isArray(emp?.employee_ranks)
      ? emp.employee_ranks[0] ?? null
      : emp?.employee_ranks ?? null

    // 🎯 USE hours_required (YOUR TABLE)
    const weeklyHours = emp?.weekly_hours ?? 0
    const requiredHours = rank?.hours_required ?? 0

    const goal_met = weeklyHours >= requiredHours

    const goal_percentage =
      requiredHours > 0
        ? Math.min((weeklyHours / requiredHours) * 100, 100)
        : 100

    return NextResponse.json({
      id: data.id,
      username: data.username,
      role_id: data.role_id,
      employee: emp
        ? {
            id: emp.id,
            name: emp.name,
            status: emp.status,

            // FROM EMPLOYEES
            weekly_hours: weeklyHours,
            weekly_earnings: emp.weekly_earnings ?? 0,
            lifetime_hours: emp.lifetime_hours ?? 0,
            lifetime_earnings: emp.lifetime_earnings ?? 0,

            // FROM RANKS
            rank: rank?.rank_name ?? null,
            wage: rank?.wage ?? 0,
            required_hours: requiredHours,

            // CALCULATED
            goal_met,
            goal_percentage
          }
        : null
    })

  } catch (err) {
    console.error("PROFILE API ERROR:", err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}