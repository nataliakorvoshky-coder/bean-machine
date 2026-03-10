"use client"

import { useEffect, useState } from "react"

export function usePermission(page:string){

const [ready,setReady] = useState(false)

useEffect(()=>{

/* temporary bypass */

setReady(true)

},[])

return ready

}