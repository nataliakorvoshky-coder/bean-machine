import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

 const { userId, username } = await req.json()

 if(!username){
  return NextResponse.json({error:"Username required"})
 }

 const { error } = await supabase
  .from("profiles")
  .update({ username })
  .eq("id", userId)

 if(error){
  return NextResponse.json({error:error.message})
 }

 return NextResponse.json({success:true})

}