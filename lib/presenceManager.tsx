import { supabase } from "@/lib/supabase"

let channel: any = null
let currentUserId: string | null = null

export async function startPresence(page: string) {

if (channel) return

const { data } = await supabase.auth.getUser()
const user = data.user

if (!user) return

currentUserId = user.id

channel = supabase.channel("online-users", {
config: {
presence: { key: user.id }
}
})

channel.subscribe(async (status: string) => {

if (status === "SUBSCRIBED") {

await channel.track({
id: user.id,
status: "active",
page
})

}

})

}

export async function updatePresence(page: string) {

if (!channel || !currentUserId) return

await channel.track({
id: currentUserId,
status: "active",
page
})

}

export function getPresenceChannel() {
return channel
}
