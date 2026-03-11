"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SidebarUsername(){

const [username,setUsername] = useState("")

useEffect(()=>{

async function load(){

const cached = sessionStorage.getItem("username")

if(cached){
setUsername(cached)
}

const { data } = await supabase.auth.getUser()

const user = data?.user
if(!user) return

const { data:profile } = await supabase
.from("profiles")
.select("username")
.eq("id",user.id)
.single()

if(profile?.username){

setUsername(profile.username)

sessionStorage.setItem(
"username",
profile.username
)

}

}

load()

},[])

return(
<span className="font-semibold min-w-[80px]">
{username}
</span>
)

}