import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(){

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      name,
      status,
      employee_ranks:rank_id (
        rank_name,
        wage
      )
    `)
    .order("name")

  if(error){

    console.error("EMPLOYEES API ERROR:", error)

    return NextResponse.json(
      { error:error.message },
      { status:500 }
    )

  }

  const formatted = (data || []).map((emp:any)=>({

    id:emp.id,
    name:emp.name,
    status:emp.status,
    hours:0,
    goal_met:false,
    rank:emp.employee_ranks?.rank_name ?? "-",
    wage:emp.employee_ranks?.wage ?? 0

  }))

  return NextResponse.json(formatted)

}


export async function POST(req:Request){

  const body = await req.json()
  const { action } = body

  try{

    if(action === "updateStatus"){

      const { id, status } = body

      const { error } = await supabase
        .from("employees")
        .update({ status })
        .eq("id", id)

      if(error) throw error

      return NextResponse.json({ success:true })

    }

    return NextResponse.json(
      { error:"Invalid action" },
      { status:400 }
    )

  }catch(error:any){

    console.error("EMPLOYEES API ERROR:", error)

    return NextResponse.json(
      { error:error.message },
      { status:500 }
    )

  }

}