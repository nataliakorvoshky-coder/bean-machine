import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL as string,
process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(req: Request) {

try{

const body = await req.json()

const userId = body.userId
const page = body.page

if(!userId || !page){
return NextResponse.json({ allowed:false })
}

const { data,error } = await supabase
.from("user_roles")
.select(`
roles (
permissions (
page,
can_view
)
)
`)
.eq("user_id",userId)
.single()

if(error || !data){
return NextResponse.json({ allowed:false })
}

const permissions = (data as any)?.roles?.permissions || []

const match = permissions.find((p:any)=>p.page === page)

return NextResponse.json({
allowed: match?.can_view === true
})

}catch(err){

return NextResponse.json({ allowed:false })

}

}