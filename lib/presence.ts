import { supabase } from "@/lib/supabase"

let channel: any = null

export async function startPresence(update: (state: any) => void) {

  if (channel) return

  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return

  channel = supabase.channel("online-users", {
    config: {
      presence: { key: user.id }
    }
  })

  channel
    .on("presence", { event: "sync" }, () => {
      update(channel.presenceState())
    })
    .on("presence", { event: "join" }, () => {
      update(channel.presenceState())
    })
    .on("presence", { event: "leave" }, () => {
      update(channel.presenceState())
    })
    .subscribe(async (status: string) => {

      if (status === "SUBSCRIBED") {

        await channel.track({
          id: user.id
        })

      }

    })

}