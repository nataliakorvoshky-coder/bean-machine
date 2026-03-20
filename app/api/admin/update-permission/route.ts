import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req:Request){

const { roleId,page,type,value } = await req.json()

const column = type==="view" ? "can_view" : "can_edit"

const { data } = await supabase
.from("permissions")
.select("*")
.eq("role_id",roleId)
.eq("page",page)
.maybeSingle()

if(data){

await supabase
.from("permissions")
.update({ [column]:value })
.eq("id",data.id)

}else{

await supabase
.from("permissions")
.insert({
role_id:roleId,
page,
can_view:type==="view" ? value : false,
can_edit:type==="edit" ? value : false
})

}

return NextResponse.json({ success:true })

}