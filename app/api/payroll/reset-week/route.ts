import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(){

  const { error } = await supabase
    .from("employees")
    .update({
      weekly_hours:0,
      weekly_minutes:0,
      weekly_earnings:0
    })
    .neq("id","")

  if(error){
    return NextResponse.json({ error:error.message },{ status:500 })
  }

  return NextResponse.json({ success:true })

}