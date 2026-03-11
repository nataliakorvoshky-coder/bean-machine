import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req:Request){

const body = await req.json()

const { section,name,current_amount,goal_amount } = body

const { error } = await supabase
.from("stock_items")
.insert({
section,
name,
current_amount,
goal_amount
})

if(error){
return NextResponse.json({error:error.message},{status:500})
}

return NextResponse.json({success:true})

}