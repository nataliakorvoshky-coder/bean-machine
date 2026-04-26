import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET() {
  try {

    // 🔹 GET EMPLOYEES
    const { data: employees, error } = await supabase
      .from("employees")
      .select("*")

    if (error) throw error

    // 🔹 GET SNAPSHOTS
    const { data: snapshots } = await supabase
      .from("employee_snapshots")
      .select("*")
      .order("created_at", { ascending: false })

    // 🔹 GET MANAGER ACTIVITY
    const { data: activity } = await supabase
      .from("manager_activity_log")
      .select("*")

    // 🔹 TOP PERFORMERS
    const weekly = [...employees]
      .sort((a,b)=>b.weekly_minutes - a.weekly_minutes)
      .slice(0,5)

    const monthly = [...employees]
      .sort((a,b)=>b.total_minutes - a.total_minutes)
      .slice(0,5)

    const yearly = monthly // (same for now unless you track yearly)

    // 🔹 PROMOTION LOGIC
    const now = new Date()

    const promotions = employees.filter(emp => {
      const hire = new Date(emp.hire_date || 0)
      const lastPromo = new Date(emp.last_promotion_date || 0)

      const weeksWorked = emp.total_minutes / (60 * 40)

      return (
        weeksWorked > 4 &&
        (now.getTime() - lastPromo.getTime()) > 1000 * 60 * 60 * 24 * 30
      )
    })

    return NextResponse.json({
      employees,
      weekly,
      monthly,
      yearly,
      promotions,
      snapshots,
      activity
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}