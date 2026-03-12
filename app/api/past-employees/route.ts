import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(){

const { data, error } = await supabase
.from("employees")
.select(`
id,
name,
status,
employee_ranks!employees_rank_id_fkey (
rank_name
)
`)
.eq("status","Terminated")
.order("name")

if(error){
console.error("Past employees API error:", error)
return NextResponse.json([], { status:200 })
}

return NextResponse.json(data ?? [])

}