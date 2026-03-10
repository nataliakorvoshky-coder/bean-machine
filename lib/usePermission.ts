"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

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

/* get role */

const { data:roleData } = await supabase
.from("user_roles")
.select("role")
.eq("user_id",user.id)
.maybeSingle()

const role = roleData?.role

/* ADMIN HAS ACCESS TO EVERYTHING */

if(role==="admin"){
return
}

/* BASIC PAGE PERMISSIONS */

if(role==="employees" && page!=="employees"){
router.replace("/dashboard")
return
}

if(role==="dashboard" && page!=="dashboard"){
router.replace("/dashboard")
return
}

if(role==="settings" && page!=="settings"){
router.replace("/dashboard")
return
}

if(role==="stock" && page!=="stock"){
router.replace("/dashboard")
return
}

}

check()

},[])

}