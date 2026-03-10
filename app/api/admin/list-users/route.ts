import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(){

try{

const { data, error } = await supabase
.from("profiles")
.select("id,email,username,disabled")

if(error){
console.error("User fetch error:", error)
return NextResponse.json({ users: [] })
}

return NextResponse.json({
users: data ?? []
})

}catch(err){

console.error(err)

return NextResponse.json({
users:[]
})

}

}