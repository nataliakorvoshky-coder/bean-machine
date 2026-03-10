"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function usePermission(page:string){

const [ready,setReady] = useState(false)

useEffect(()=>{

async function check(){

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
setReady(false)
return
}

const { data:userRole } = await supabase
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.maybeSingle()

if(!userRole){
setReady(false)
return
}

/* admin bypass */

const { data:role } = await supabase
.from("roles")
.select("name")
.eq("id",userRole.role_id)
.maybeSingle()

if(role?.name === "admin"){
setReady(true)
return
}

const { data:permissions } = await supabase
.from("permissions")
.select("page,can_view")
.eq("role_id",userRole.role_id)

const allowed = permissions?.find(
(p:any)=>p.page===page
)

setReady(allowed?.can_view ?? false)

}

check()

},[page])

return ready

}