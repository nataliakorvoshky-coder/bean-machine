"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { usePathname } from "next/navigation"
import { initPresence,updatePage,subscribePresence } from "@/lib/presence"

type PresenceState = Record<string,any>

const PresenceContext = createContext<{presence:PresenceState}>({
presence:{}
})

export function PresenceProvider({children}:{children:React.ReactNode}){

const pathname = usePathname()

const [presence,setPresence] = useState<PresenceState>({})

useEffect(()=>{

initPresence(pathname)

subscribePresence(setPresence)

},[])

useEffect(()=>{

updatePage(pathname)

},[pathname])

return(

<PresenceContext.Provider value={{presence}}>
{children}
</PresenceContext.Provider>

)

}

export function usePresence(){
return useContext(PresenceContext)
}
