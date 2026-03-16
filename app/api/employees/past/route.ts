import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(){

try{

/* ======================
GET TERMINATED EMPLOYEES
====================== */

const { data:employees, error } = await supabase
.from("employees")
.select(`
id,
name,
status,
termination_date
`)
.eq("status","Terminated")
.order("termination_date",{ ascending:false })

if(error){
throw error
}


/* ======================
GET STRIKE COUNTS
====================== */

const { data:strikes } = await supabase
.from("employee_strikes")
.select("employee_id")

const strikeMap:Record<string,number> = {}

strikes?.forEach((s:any)=>{
strikeMap[s.employee_id] =
(strikeMap[s.employee_id] ?? 0) + 1
})


/* ======================
FORMAT RESPONSE
====================== */

const formatted = employees?.map((emp:any)=>({

id:emp.id,
name:emp.name,
status:"Terminated",
termination_date:emp.termination_date,
strikes: strikeMap[emp.id] ?? 0

}))


return NextResponse.json(formatted ?? [])

}catch(err){

console.error("PAST EMPLOYEES ERROR:",err)

return NextResponse.json(
{ error:"Failed loading past employees" },
{ status:500 }
)

}

}