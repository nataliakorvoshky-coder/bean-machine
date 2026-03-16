"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LogoutButton(){

const router = useRouter()

async function logout(){

try{

const { error } = await supabase.auth.signOut()

if(error){
console.error("Logout error:", error.message)
return
}

/* redirect to home page */

router.replace("/")

/* refresh UI */

router.refresh()

}catch(err){

console.error("Logout failed:", err)

}

}

return(

<button
onClick={logout}
className="
bg-red-500
hover:bg-red-600
text-white
px-4
py-2
rounded-lg
text-sm
font-semibold
transition
"
>
Logout
</button>

)

}