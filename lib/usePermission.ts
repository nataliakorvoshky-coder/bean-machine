"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

const router = useRouter()
const [ready,setReady] = useState(false)

useEffect(()=>{

async function check(){

/* get logged in user */

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
router.replace("/")
return
}

/* get role id */

const { data:userRole } = await supabase
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.maybeSingle()

if(!userRole){
router.replace("/dashboard")
return
}

/* get role name */

const { data:role } = await supabase
.from("roles")
.select("name")
.eq("id",userRole.role_id)
.maybeSingle()

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

const allowed = permissions?.find(
(p:any)=>p.page===page
)

if(!allowed?.can_view){
router.replace("/dashboard")
return
}

setReady(true)

}

check()

},[page])

return ready

}