"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

type ReadyContextType = {
ready:boolean
}

const ReadyContext = createContext<ReadyContextType>({
ready:false
})

export function AppReadyProvider({
children
}:{children:React.ReactNode}){

const [ready,setReady] = useState(false)

useEffect(()=>{

async function init(){

/* wait for auth session */

await supabase.auth.getSession()

/* tiny delay ensures hydration finishes */

requestAnimationFrame(()=>{
setReady(true)
})

}

init()

},[])

return(

<ReadyContext.Provider value={{ready}}>

{children}

</ReadyContext.Provider>

)

}

export function useAppReady(){

return useContext(ReadyContext)

}