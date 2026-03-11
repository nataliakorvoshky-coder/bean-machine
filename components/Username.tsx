"use client"

import { useAdminData } from "@/lib/AdminDataContext"

export default function Username(){

const { username } = useAdminData()

return(

<span className="font-semibold min-w-[80px]">
{username}
</span>

)

}