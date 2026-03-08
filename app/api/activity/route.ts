import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request){

 const { searchParams } = new URL(req.url)

 const username = searchParams.get("username")

 let query = supabase
  .from("activity_logs")
  .select("*")
  .order("created_at",{ascending:false})
  .limit(50)

 if(username){
  query = query.eq("username", username)
 }

 const { data } = await query

 return NextResponse.json({ logs:data })

}