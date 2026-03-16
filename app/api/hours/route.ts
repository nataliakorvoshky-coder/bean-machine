import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

try{

const body = await req.json()

const {
employee_id,
date,
hours,
minutes
} = body


const { error } = await supabase
.from("work_hours")
.insert({
employee_id,
work_date:date,
hours,
minutes
})

if(error) throw error

return NextResponse.json({ success:true })

}catch(err){

console.error("SUBMIT HOURS ERROR:",err)

return NextResponse.json(
{ error:"Failed submitting hours" },
{ status:500 }
)

}

}