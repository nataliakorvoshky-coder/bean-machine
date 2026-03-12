import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request){

  try{

    const body = await req.json()

    const { employee_id, hours, minutes } = body

    if(!employee_id){
      return NextResponse.json(
        { error:"Missing employee id" },
        { status:400 }
      )
    }

    const addedMinutes = (Number(hours) * 60) + Number(minutes)

    /* GET EMPLOYEE */

    const { data:employee, error:empError } = await supabase
      .from("employees")
      .select("worked_minutes, paid_hours, rank_id")
      .eq("id",employee_id)
      .single()

    if(empError){
      return NextResponse.json(
        { error:empError.message },
        { status:500 }
      )
    }

    const totalMinutes =
      (employee.worked_minutes ?? 0) + addedMinutes


    /* CALCULATE FULL HOURS */

    const newPaidHours = Math.floor(totalMinutes / 60)


    /* GET WAGE */

    const { data:rank } = await supabase
      .from("employee_ranks")
      .select("wage")
      .eq("id",employee.rank_id)
      .single()

    const wage = rank?.wage ?? 0


    /* CALCULATE TOTAL EARNINGS */

    const earnings = newPaidHours * wage


    /* UPDATE EMPLOYEE */

    const { error:updateError } = await supabase
      .from("employees")
      .update({
        worked_minutes: totalMinutes,
        paid_hours: newPaidHours,
        earnings: earnings
      })
      .eq("id",employee_id)

    if(updateError){
      return NextResponse.json(
        { error:updateError.message },
        { status:500 }
      )
    }

    return NextResponse.json({
      success:true,
      total_minutes: totalMinutes,
      paid_hours: newPaidHours,
      earnings: earnings
    })

  }catch(err){

    console.error("HOURS SUBMIT ERROR:", err)

    return NextResponse.json(
      { error:"Server error submitting hours" },
      { status:500 }
    )

  }

}