import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

 const { userId } = await req.json()

 if(!userId){
  return NextResponse.json({error:"Missing userId"})
 }

 const { data: existing } = await supabase
  .from("profiles")
  .select("id")
  .eq("id", userId)
  .maybeSingle()

 if(existing){
  return NextResponse.json({success:true})
 }

 await supabase
  .from("profiles")
  .insert({
   id:userId,
   username:"User"
  })

 return NextResponse.json({success:true})

}