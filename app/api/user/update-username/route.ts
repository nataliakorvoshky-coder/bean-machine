import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

 const { userId, username } = await req.json()

 if(!userId || !username){
  return NextResponse.json({error:"Missing data"})
 }

 const { error } = await supabase
  .from("profiles")
  .upsert({
   id:userId,
   username
  })

 if(error){
  return NextResponse.json({error:error.message})
 }

 return NextResponse.json({success:true})

}