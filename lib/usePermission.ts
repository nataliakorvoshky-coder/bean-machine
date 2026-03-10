"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

const router = useRouter()

useEffect(()=>{

async function check(){

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user) return

const { data:roleData } = await supabase
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.single()

if(!roleData){
router.replace("/dashboard")
return
}

const { data:permissions } = await supabase
.from("permissions")
.select("page,can_view")
.eq("role_id",roleData.role_id)

const allowed = permissions?.find(
(p:any)=>p.page===page
)

if(!allowed?.can_view){
router.replace("/dashboard")
}

}

check()

},[])

}