"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function usePermission(page:string){

const [ready,setReady] = useState(false)

useEffect(()=>{

async function check(){

console.log("checking permission for",page)

/* get user */

const { data:userData,error:userError } = await supabase.auth.getUser()

console.log("user",userData,userError)

const user = userData?.user

if(!user){
setReady(true)
return
}

/* get role */

const { data:userRole,error:roleError } = await supabase
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.maybeSingle()

console.log("userRole",userRole,roleError)

/* if no role -> allow temporarily */

if(!userRole){
setReady(true)
return
}

/* get role name */

const { data:role } = await supabase
.from("roles")
.select("name")
.eq("id",userRole.role_id)
.maybeSingle()

console.log("role",role)

/* admin bypass */

if(role?.name === "admin"){
setReady(true)
return
}

/* check permissions */

const { data:permissions } = await supabase
.from("permissions")
.select("page,can_view")
.eq("role_id",userRole.role_id)

console.log("permissions",permissions)

const allowed = permissions?.find(
(p:any)=>p.page===page
)

setReady(allowed?.can_view ?? false)

}

check()

},[page])

return ready

}