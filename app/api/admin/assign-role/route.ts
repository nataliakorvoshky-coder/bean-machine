import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

const { userId,roleId } = await req.json()

await supabase
.from("user_roles")
.upsert({
user_id:userId,
role_id:roleId
})

return NextResponse.json({ success:true })

}