import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req:Request){

const { searchParams } = new URL(req.url)

const user = searchParams.get("user")
const type = searchParams.get("type")

let query = supabase
.from("activity_log")
.select("*")
.order("created_at",{ascending:false})
.limit(50)

if(user){
query = query.eq("username",user)
}

if(type){
query = query.eq("type",type)
}

const { data } = await query

return NextResponse.json({
logs:data || []
})

}