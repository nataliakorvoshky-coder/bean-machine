import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

 try{

  const { id } = await req.json()

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

  if(error){

   return NextResponse.json({
    error:error.message
   })

  }

  return NextResponse.json({
   success:true
  })

 }catch(err){

  return NextResponse.json({
   error:"Server error"
  })

 }

}