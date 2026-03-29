import { supabase } from "@/lib/supabase";

let channel: any = null;
let initialized = false;

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: any;
  old: any;
};

export function startRealtime(handlers: {
  onRequestUpdate?: (payload: any) => void;
}) {
  if (initialized) return;
  initialized = true;

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("❌ No user → realtime not started");
      initialized = false;
      return;
    }

    console.log("🟢 Global realtime starting...");

    // 🔥 CLEAN OLD CHANNEL (VERY IMPORTANT)
    if (channel) {
      supabase.removeChannel(channel);
    }

    channel = supabase.channel("global-live");

    // ✅ EVENT LISTENER
    if (handlers.onRequestUpdate) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        (payload: RealtimePayload) => {
          handlers.onRequestUpdate?.({
            type: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      );
    }

    // ✅ ALWAYS SUBSCRIBE (FIX)
    channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        console.log("🟢 Global realtime connected");
      }

      if (status === "CHANNEL_ERROR") {
        console.error("❌ Realtime error → retrying...");

        initialized = false;

        setTimeout(() => startRealtime(handlers), 1000);
      }
    });
  }

  init();
}

export function stopRealtime() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    initialized = false;
  }
}