import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req:Request){

const body = await req.json()

const { id,field,value } = body

const { error } = await supabase
.from("employees")
.update({ [field]:value })
.eq("id",id)

if(error){

return NextResponse.json(
{ error:error.message },
{ status:500 }
)

}

return NextResponse.json({ success:true })

}