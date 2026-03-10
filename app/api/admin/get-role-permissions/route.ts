import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

const { roleId } = await req.json()

const { data } = await supabase
.from("permissions")
.select("*")
.eq("role_id",roleId)

return NextResponse.json({ permissions:data })

}