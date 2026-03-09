import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req:Request){

const body = await req.json()

await supabase
.from("activity_log")
.insert({
username: body.username,
action: body.action,
type: body.type
})

return NextResponse.json({success:true})

}