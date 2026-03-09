import { supabase } from "@/lib/supabase"

let channel: any = null
let listeners: any[] = []
let state: Record<string, any> = {}

function notify() {
  listeners.forEach((cb) => cb({ ...state }))
}

export function subscribePresence(cb: any) {
  listeners.push(cb)
  cb(state)
}

export async function startPresence(page: string) {

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) return

  if (channel) return

  channel = supabase.channel("online-users", {
    config: { presence: { key: user.id } }
  })

  channel
    .on("presence", { event: "sync" }, () => {

      state = channel.presenceState()
      notify()

    })
    .on("presence", { event: "join" }, () => {

      state = channel.presenceState()
      notify()

    })
    .on("presence", { event: "leave" }, () => {

      state = channel.presenceState()
      notify()

    })
    .subscribe(async (status: string) => {

      if (status === "SUBSCRIBED") {

        await channel.track({
          id: user.id,
          page,
          status: "active",
          ts: Date.now()
        })

      }

    })

}

export async function updatePresence(page: string) {

  if (!channel) return

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) return

  await channel.track({
    id: user.id,
    page,
    status: "active",
    ts: Date.now()
  })

}