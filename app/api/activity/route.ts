import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req:Request){

 const { searchParams } = new URL(req.url)
 const username = searchParams.get("username")

 let query = supabase
  .from("activity_log")
  .select("*")
  .order("created_at",{ ascending:false })

 if(username){
  query = query.ilike("username", `%${username}%`)
 }

 const { data,error } = await query

 if(error){
  return NextResponse.json({ error:error.message })
 }

 return NextResponse.json({
  logs:data
 })

}