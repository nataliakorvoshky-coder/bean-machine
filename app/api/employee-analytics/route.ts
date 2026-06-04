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
  .select(`
    *,
    employee_ranks (
      rank_name
    )
  `)

    if (error) throw error

    // 🔹 GET SNAPSHOTS
    const { data: snapshots } = await supabase
      .from("employee_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })

    // 🔹 GET MANAGER ACTIVITY
    const { data: activity } = await supabase
      .from("manager_activity_log")
      .select("*")



// 🔹 GET WORK HOURS
const { data: workHours } = await supabase
  .from("work_hours")
  .select("*")

    // 🔹 TOP PERFORMERS
const weeklySnapshots =
  snapshots?.filter(s => s.snapshot_type === "weekly") || []

const latestWeek =
  weeklySnapshots.length > 0
    ? weeklySnapshots[0].snapshot_date
    : null

const weekly = latestWeek
  ? weeklySnapshots
      .filter(s => s.snapshot_date === latestWeek)
      .sort((a, b) => b.total_minutes - a.total_minutes)
      .slice(0, 5)

: employees
    .filter(emp => {

      const rank =
        emp.employee_ranks?.rank_name
          ?.toLowerCase()
          .trim() || ""

      return ![
        "coffee panda",
        "croissant",
        "frappuccino"
      ].some(hidden =>
        rank.includes(hidden)
      )

    })

    .map(emp => ({
      employee_name: emp.name,
      total_minutes:
        (emp.lifetime_hours || 0) * 60
    }))
      .sort((a, b) => b.total_minutes - a.total_minutes)
      .slice(0, 5)

// 🔥 LAST 30 DAYS
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const monthlyMap: Record<string, any> = {}

weeklySnapshots.forEach(s => {

  const snapDate = new Date(s.snapshot_date)

  if (snapDate >= thirtyDaysAgo) {

    if (!monthlyMap[s.employee_id]) {
      monthlyMap[s.employee_id] = {
        employee_id: s.employee_id,
        name: s.employee_name,
        total_minutes: 0,
      }
    }

    monthlyMap[s.employee_id].total_minutes += s.total_minutes
  }
})

const monthly =
  Object.keys(monthlyMap).length > 0

    ? Object.values(monthlyMap)
        .sort((a: any, b: any) => b.total_minutes - a.total_minutes)
        .slice(0,5)

: employees
    .filter(emp => {

      const rank =
        emp.employee_ranks?.rank_name
          ?.toLowerCase()
          .trim() || ""

      return ![
        "coffee panda",
        "croissant",
        "frappuccino"
      ].some(hidden =>
        rank.includes(hidden)
      )

    })

    .map(emp => ({
      employee_name: emp.name,
      total_minutes:
        (emp.lifetime_hours || 0) * 60
    }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0,5)


// 🔥 LAST 365 DAYS
const yearlyMap: Record<string, any> = {}

const yearAgo = new Date()
yearAgo.setDate(yearAgo.getDate() - 365)

weeklySnapshots.forEach(s => {

  const snapDate = new Date(s.snapshot_date)

  if (snapDate >= yearAgo) {

    if (!yearlyMap[s.employee_id]) {
      yearlyMap[s.employee_id] = {
        employee_id: s.employee_id,
        name: s.employee_name,
        total_minutes: 0,
      }
    }

    yearlyMap[s.employee_id].total_minutes += s.total_minutes
  }
})

const yearly =
  Object.keys(yearlyMap).length > 0

    ? Object.values(yearlyMap)
        .sort((a: any, b: any) => b.total_minutes - a.total_minutes)
        .slice(0,5)

: employees
    .filter(emp => {

      const rank =
        emp.employee_ranks?.rank_name
          ?.toLowerCase()
          .trim() || ""

      return ![
        "coffee panda",
        "croissant",
        "frappuccino"
      ].some(hidden =>
        rank.includes(hidden)
      )

    })

    .map(emp => ({
      employee_name: emp.name,
      total_minutes:
        (emp.lifetime_hours || 0) * 60
    }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0,5)

  // 🔥 TOP EMPLOYEES (LIFETIME)
// 🔥 TRUE LIFETIME HOURS FROM WORK LOGS
const employeeLifetimeMap: Record<string, number> = {}

workHours?.forEach((log: any) => {

  const totalMinutes =
    ((log.hours || 0) * 60) +
    (log.minutes || 0)

  employeeLifetimeMap[log.employee_id] =
    (employeeLifetimeMap[log.employee_id] || 0) +
    totalMinutes

})

const topEmployees = employees
  .map(emp => {

    const lifetimeMinutes =
      employeeLifetimeMap[emp.id] || 0

    return {
      ...emp,
      calculated_lifetime_hours:
        Math.floor(lifetimeMinutes / 60)
    }

  })
  .sort(
    (a: any, b: any) =>
      b.calculated_lifetime_hours -
      a.calculated_lifetime_hours
  )
  .slice(0, 5)

  console.log(workHours?.[0])

    // 🔹 PROMOTION LOGIC
    const now = new Date()

const promotions = employees.filter(emp => {

  const hire = new Date(emp.hire_date || 0)
 const lastPromo = emp.last_promotion_date
  ? new Date(emp.last_promotion_date)
  : hire

  // 🔥 EMPLOYMENT DURATION
  const weeksEmployed =
    (now.getTime() - hire.getTime()) /
    (1000 * 60 * 60 * 24 * 7)

// 🔥 HOURS WORKED SINCE LAST PROMOTION
const promotionCutoff =
  emp.last_promotion_date || emp.hire_date

const minutesSincePromotion =
  workHours
    ?.filter(log => {

      if (log.employee_id !== emp.id) return false

      const logDate = new Date(log.created_at)
      const cutoff = new Date(promotionCutoff)

      return logDate >= cutoff

    })
    .reduce((sum, log) => {

      return (
        sum +
        ((log.hours || 0) * 60) +
        (log.minutes || 0)
      )

    }, 0) || 0

const totalHoursWorked = minutesSincePromotion / 60

  // 🔥 TIME SINCE LAST PROMOTION
  const daysSincePromotion =
    (now.getTime() - lastPromo.getTime()) /
    (1000 * 60 * 60 * 24)

  return (
    weeksEmployed >= 4 &&          // employed at least 4 weeks
    totalHoursWorked >= 20 &&      // worked at least 20 hours
    daysSincePromotion >= 30       // no recent promotion
  )
})

return NextResponse.json({
  employees,
  weekly,
  monthly,
  yearly,
  topEmployees,
  promotions,
  snapshots,
  activity
})

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}