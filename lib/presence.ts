import { supabase } from "@/lib/supabase"

type PresenceState = Record<string, any>

let channel: any = null
let presenceState: PresenceState = {}

const listeners: Array<(state: PresenceState) => void> = []

export function subscribePresence(cb: (state: PresenceState) => void) {
listeners.push(cb)
cb(presenceState)
}

function notify() {
listeners.forEach((cb) => cb({ ...presenceState }))
}

export async function initPresence(page: string) {
if (channel) return

const { data } = await supabase.auth.getUser()
const user = data?.user

if (!user) return

channel = supabase.channel("online-users", {
config: { presence: { key: user.id } },
})

channel
.on("presence", { event: "sync" }, () => {
presenceState = channel.presenceState()
notify()
})
.on("presence", { event: "join" }, () => {
presenceState = channel.presenceState()
notify()
})
.on("presence", { event: "leave" }, () => {
presenceState = channel.presenceState()
notify()
})
.subscribe(async (status: string) => {
if (status === "SUBSCRIBED") {
await channel.track({
id: user.id,
page,
status: "active",
})
}
})
}

export async function updatePage(page: string) {
if (!channel) return

const { data } = await supabase.auth.getUser()
const user = data?.user

if (!user) return

await channel.track({
id: user.id,
page,
status: "active",
})
}
