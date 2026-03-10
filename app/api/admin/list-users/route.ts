import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(){

const { data, error } = await supabase
.from("profiles")
.select("id, username, disabled")
.order("username")

if(error){
console.error(error)
return NextResponse.json({ users: [] })
}

return NextResponse.json({
users: data ?? []
})

}