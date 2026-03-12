import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"



/* ======================
   GET EMPLOYEE
====================== */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
){

  try {

    const { id } = await params

    if(!id){
      return NextResponse.json(
        { error:"Missing employee id" },
        { status:400 }
      )
    }


    /* GET EMPLOYEE */

    const { data: employee, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        status,
        rank_id,
        hire_date,
        phone,
        cid,
        iban,
        last_promotion_date,
        strikes,
        current_hours,
        lifetime_hours,
        earnings,
        lifetime_earnings
      `)
      .eq("id", id)
      .single()

    if(error){
      console.error("EMPLOYEE FETCH ERROR:", error)

      return NextResponse.json(
        { error:error.message },
        { status:500 }
      )
    }



    /* GET RANK */

    const { data: rank } = await supabase
      .from("employee_ranks")
      .select("rank_name,wage")
      .eq("id", employee.rank_id)
      .single()



    /* GET STRIKE HISTORY */

    const { data: strikeHistory } = await supabase
      .from("employee_strikes")
      .select("*")
      .eq("employee_id", id)
      .order("created_at",{ ascending:false })



    return NextResponse.json({

      ...employee,

      rank: rank?.rank_name ?? "-",
      wage: rank?.wage ?? 0,

      current_hours: employee.current_hours ?? 0,
      lifetime_hours: employee.lifetime_hours ?? 0,

      earnings: employee.earnings ?? 0,
      lifetime_earnings: employee.lifetime_earnings ?? 0,

      strike_history: strikeHistory ?? []

    })

  }

  catch(err){

    console.error("GET EMPLOYEE CRASH:", err)

    return NextResponse.json(
      { error:"Server error" },
      { status:500 }
    )

  }

}



/* ======================
   UPDATE EMPLOYEE
====================== */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
){

  try {

    const { id } = await params
    const body = await req.json()

    const updates:any = {}


    if(body.status){
      updates.status = body.status
    }

    if(body.last_promotion_date){
      updates.last_promotion_date = body.last_promotion_date
    }


    if(Object.keys(updates).length === 0){

      return NextResponse.json(
        { error:"No valid fields provided" },
        { status:400 }
      )

    }


    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if(error){

      console.error("UPDATE ERROR:", error)

      return NextResponse.json(
        { error:error.message },
        { status:500 }
      )

    }


    return NextResponse.json({
      success:true,
      updated:data
    })

  }

  catch(err){

    console.error("POST EMPLOYEE CRASH:", err)

    return NextResponse.json(
      { error:"Server error updating employee" },
      { status:500 }
    )

  }

}