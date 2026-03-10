"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

const router = useRouter()

useEffect(()=>{

async function checkPermission(){

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
router.replace("/")
return
}

/* GET ROLE */

const { data:roleData } = await supabase
.from("user_roles")
.select(`
roles(
id,
name
)
`)
.eq("user_id",user.id)
.single()

const role = roleData?.roles?.[0]?.name

/* ADMIN ALWAYS ALLOWED */

if(role==="admin"){
return
}

const roleId = roleData?.roles?.[0]?.id

if(!roleId){
router.replace("/dashboard")
return
}

/* CHECK PERMISSIONS */

const { data:permissions } = await supabase
.from("permissions")
.select("page,can_view")
.eq("role_id",roleId)

const allowed = permissions?.find(
(p:any)=>p.page===page
)

if(!allowed?.can_view){
router.replace("/dashboard")
}

}

checkPermission()

},[page,router])

}