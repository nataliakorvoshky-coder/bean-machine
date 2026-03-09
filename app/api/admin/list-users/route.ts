import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(){

try{

/* get auth users */

const { data: authUsers, error } = await supabase.auth.admin.listUsers()

if(error){
return NextResponse.json({ users: [] })
}

/* get profile usernames */

const { data: profiles } = await supabase
.from("profiles")
.select("id, username")

const profileMap:any = {}

profiles?.forEach((p:any)=>{
profileMap[p.id] = p.username
})

/* merge users */

const users = authUsers.users.map((u:any)=>({

id: u.id,
email: u.email,
username: profileMap[u.id] || null

}))

return NextResponse.json({ users })

}catch(err){

return NextResponse.json({ users: [] })

}

}
