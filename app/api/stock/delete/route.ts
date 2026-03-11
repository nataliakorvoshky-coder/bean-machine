import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req:Request){

const body = await req.json()

const { id } = body

await supabase
.from("stock_items")
.delete()
.eq("id",id)

return NextResponse.json({success:true})

}