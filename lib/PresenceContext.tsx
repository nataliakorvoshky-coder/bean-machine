"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { startPresence, updatePresence, getPresenceChannel } from "@/lib/presenceManager"

type PresenceState = Record<string, any>

interface PresenceContextType {
presence: PresenceState
}

const PresenceContext = createContext<PresenceContextType>({
presence: {}
})

export function PresenceProvider({ children }: { children: React.ReactNode }) {

const pathname = usePathname()

const [presence, setPresence] = useState<PresenceState>({})

useEffect(() => {

async function init() {

await startPresence(pathname)

const channel = getPresenceChannel()

if (!channel) return

channel.on("presence", { event: "sync" }, () => {

const state = channel.presenceState()

setPresence({ ...state })

})

}

init()

}, [])

useEffect(() => {

updatePresence(pathname)

}, [pathname])

return (
<PresenceContext.Provider value={{ presence }}>
{children}
</PresenceContext.Provider>
)

}

export function usePresence() {
return useContext(PresenceContext)
}
