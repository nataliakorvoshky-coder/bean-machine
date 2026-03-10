"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

const router = useRouter()

useEffect(()=>{

async function check(){

const { data } = await supabase.auth.getUser()
const user = data?.user

if(!user){
router.replace("/")
return
}

const { data:roleData } = await supabase
.from("user_roles")
.select(`
roles (
name
)
`)
.eq("user_id",user.id)
.single()

const role = roleData?.roles?.[0]?.name

/* Admin can access EVERYTHING */

if(role==="admin"){
return
}

/* Page permissions */

const permissions:any = {

manager:["dashboard","employees","settings"],

supervisor:["dashboard","employees","settings"],

employee:["dashboard","settings"]

}

const allowed = permissions[role]?.includes(page)

if(!allowed){
router.replace("/dashboard")
}

}

check()

},[page,router])

}