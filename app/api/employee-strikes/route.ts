import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

try{

const body = await req.json()

const { employee_id, reason } = body

if(!employee_id || !reason){

return NextResponse.json(
{ error:"Missing strike information" },
{ status:400 }
)

}

const { error } = await supabase
.from("employee_strikes")
.insert({
employee_id,
reason
})

if(error){

return NextResponse.json(
{ error:error.message },
{ status:500 }
)

}

return NextResponse.json({ success:true })

}catch(err){

return NextResponse.json(
{ error:"Server error" },
{ status:500 }
)

}

}