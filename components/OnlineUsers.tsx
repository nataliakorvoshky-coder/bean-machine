"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function OnlineUsers(){

useEffect(()=>{

async function test(){

const { data } = await supabase.auth.getUser()

console.log("user session", data)

const user = data?.user

if(!user) return

const result = await supabase
.from("online_users")
.insert({
user_id:user.id,
page:"dashboard",
last_seen:new Date().toISOString()
})

console.log("insert result", result)

}

test()

},[])

return(
<div className="bg-white p-6 rounded shadow">
Online Users Test
</div>
)

}