import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(){

 try{

  const { data: users } = await supabaseAdmin.auth.admin.listUsers()

  const { data: profiles } = await supabaseAdmin
   .from("profiles")
   .select("id,username")

  const merged = users.users.map((u:any)=>{

   const profile = profiles?.find(p => p.id === u.id)

   return{
    id:u.id,
    email:u.email,
    username:profile?.username || "User"
   }

  })

  return NextResponse.json({
   users:merged
  })

 }catch(err){

  return NextResponse.json({
   users:[]
  })

 }
}