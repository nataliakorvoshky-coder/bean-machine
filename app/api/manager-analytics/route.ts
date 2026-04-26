import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET(){

  try{

    // 🔹 get manager activity
    const { data: logs, error } = await supabase
      .from("manager_activity_log")
      .select("*")

    if(error) throw error

    // 🔹 group by manager
    const managers: any = {}

    logs.forEach(log => {

      if(!managers[log.manager_id]){
        managers[log.manager_id] = {
          id: log.manager_id,
          name: log.manager_name,
          total_actions: 0,
          approvals: 0,
          promotions: 0,
          terminations: 0,
          requests: 0
        }
      }

      managers[log.manager_id].total_actions++

      if(log.action === "approve_hours") managers[log.manager_id].approvals++
      if(log.action === "promotion") managers[log.manager_id].promotions++
      if(log.action === "termination") managers[log.manager_id].terminations++
      if(log.action === "request") managers[log.manager_id].requests++

    })

    return NextResponse.json({
      managers: Object.values(managers)
    })

  }catch(err){
    console.error(err)
    return NextResponse.json({ error:"failed" },{ status:500 })
  }

}