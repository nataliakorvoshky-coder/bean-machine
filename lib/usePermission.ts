"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function usePermission(page:string){

const [loading,setLoading] = useState(true)
const [allowed,setAllowed] = useState(false)

useEffect(()=>{

async function check(){

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
setLoading(false)
return
}

const { data:userRole } = await supabase
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.maybeSingle()

if(!userRole){
setAllowed(true) // fallback admin safety
setLoading(false)
return
}

const { data:permissions } = await supabase
.from("permissions")
.select("page,can_view")
.eq("role_id",userRole.role_id)

const match = permissions?.find(p => p.page === page)

setAllowed(match?.can_view ?? false)
setLoading(false)

}

check()

},[page])

return { loading, allowed }

}