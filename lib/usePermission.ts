"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function usePermission(page:string){

const router = useRouter()
const [ready,setReady] = useState(false)

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
.select("role")
.eq("user_id",user.id)
.maybeSingle()

if(!roleData){
router.replace("/dashboard")
return
}

const role = roleData.role

if(role==="admin"){
setReady(true)
return
}

if(role!==page){
router.replace("/dashboard")
return
}

setReady(true)

}

check()

},[])

return ready

}