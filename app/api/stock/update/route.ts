import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req:Request){

const body = await req.json()

const { id,current_amount,goal_amount } = body

const { error } = await supabase
.from("stock_items")
.update({
current_amount,
goal_amount
})
.eq("id",id)

if(error){
return NextResponse.json({error:error.message},{status:500})
}

return NextResponse.json({success:true})

}