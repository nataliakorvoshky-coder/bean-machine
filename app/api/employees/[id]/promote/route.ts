import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
){

  try{

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
      .select("rank_id")
      .eq("id", id)
      .single()

    if(error || !employee){
      console.error("EMPLOYEE FETCH ERROR:", error)

      return NextResponse.json(
        { error:"Employee not found" },
        { status:500 }
      )
    }


    const currentRank = employee.rank_id


    /* GET NEXT RANK */

    const { data: nextRank } = await supabase
      .from("employee_ranks")
      .select("*")
      .gt("id", currentRank)
      .order("id",{ ascending:true })
      .limit(1)
      .single()


    if(!nextRank){
      return NextResponse.json({
        success:false,
        message:"Employee already at highest rank"
      })
    }


    const today = new Date().toISOString()


    /* UPDATE EMPLOYEE */

    const { error:updateError } = await supabase
      .from("employees")
      .update({
        rank_id: nextRank.id,
        last_promotion_date: today
      })
      .eq("id", id)

    if(updateError){
      console.error("UPDATE ERROR:", updateError)

      return NextResponse.json(
        { error:updateError.message },
        { status:500 }
      )
    }


    return NextResponse.json({
      success:true,
      rank: nextRank.rank_name,
      wage: nextRank.wage,
      rank_id: nextRank.id,
      last_promotion_date: today
    })

  }catch(err){

    console.error("PROMOTION CRASH:", err)

    return NextResponse.json(
      { error:"Promotion server error" },
      { status:500 }
    )

  }

}