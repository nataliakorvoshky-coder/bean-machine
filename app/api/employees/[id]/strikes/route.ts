import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"



/* ADD STRIKE */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id:string }> }
){

  try{

    const { id } = await params
    const body = await req.json()

    const reason = body.reason

    if(!reason){

      return NextResponse.json(
        { error:"Missing strike reason" },
        { status:400 }
      )

    }


    /* GET CURRENT STRIKE COUNT */

    const { data: employee } = await supabase
      .from("employees")
      .select("strikes")
      .eq("id",id)
      .single()


    const newStrikeNumber = (employee?.strikes ?? 0) + 1



    /* INSERT STRIKE HISTORY */

    const { error: insertError } = await supabase
      .from("employee_strikes")
      .insert({
        employee_id:id,
        number:newStrikeNumber,
        reason:reason,
        created_at:new Date().toISOString()
      })


    if(insertError){

      console.error("STRIKE INSERT ERROR:", insertError)

      return NextResponse.json(
        { error:insertError.message },
        { status:500 }
      )

    }



    /* UPDATE STRIKE COUNT */

    await supabase
      .from("employees")
      .update({ strikes:newStrikeNumber })
      .eq("id",id)



    /* RETURN UPDATED HISTORY */

    const { data: history } = await supabase
      .from("employee_strikes")
      .select("*")
      .eq("employee_id",id)
      .order("created_at",{ ascending:false })


    return NextResponse.json({
      success:true,
      strikes:newStrikeNumber,
      history
    })


  }catch(err){

    console.error("STRIKE API CRASH:", err)

    return NextResponse.json(
      { error:"Server error" },
      { status:500 }
    )

  }

}




/* DELETE STRIKE */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id:string }> }
){

  try{

    const { id } = await params
    const body = await req.json()

    const strikeId = body.strike_id


    await supabase
      .from("employee_strikes")
      .delete()
      .eq("id",strikeId)



    const { data: history } = await supabase
      .from("employee_strikes")
      .select("*")
      .eq("employee_id",id)
      .order("created_at",{ ascending:false })


    const strikeCount = history?.length ?? 0


    await supabase
      .from("employees")
      .update({ strikes:strikeCount })
      .eq("id",id)



    return NextResponse.json({
      success:true,
      history,
      strikes:strikeCount
    })


  }catch(err){

    console.error("DELETE STRIKE CRASH:", err)

    return NextResponse.json(
      { error:"Server error" },
      { status:500 }
    )

  }

}