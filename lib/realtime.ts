import { supabase } from "@/lib/supabase";

let channel: any = null;
let isActive = false; // ✅ PREVENT DUPLICATES

export function initRealtime({
  onEmployeeUpdate,
  onStrikeUpdate,
  onTerminationUpdate,
  onRequestUpdate,
  onPresenceUpdate,

  // 🔥 ADD THIS
  onWorkHoursUpdate,
}: {
  onEmployeeUpdate?: (payload: any) => void;
  onStrikeUpdate?: (payload: any) => void;
  onTerminationUpdate?: (payload: any) => void;
  onRequestUpdate?: (payload: any) => void;
  onPresenceUpdate?: (payload: any) => void;
  onWorkHoursUpdate?: (payload: any) => void;
}) {
  if (typeof window === "undefined") return () => {};

  // ✅ PREVENT RE-INIT (THIS IS THE FIX)
  if (isActive && channel) {
    console.log("🟡 Realtime already active — skipping");
    return () => {};
  }

  isActive = true;

  console.log("🟢 Initializing realtime...");

  const newChannel = supabase.channel("global-live");

  const handle = (cb?: Function) => (payload: any) => {
    if (!cb) return;

    cb({
      type: payload.eventType,
      new: payload.new ?? null,
      old: payload.old ?? null,
    });
  };

  // ✅ EMPLOYEES
  if (onEmployeeUpdate) {
    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employees" },
      handle(onEmployeeUpdate)
    );
  }

  // ✅ STRIKES
  if (onStrikeUpdate) {
    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employee_strikes" },
      handle(onStrikeUpdate)
    );
  }

  // ✅ TERMINATIONS
  if (onTerminationUpdate) {
    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "termination_history" },
      handle(onTerminationUpdate)
    );
  }

  // ✅ REQUESTS
  if (onRequestUpdate) {
    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "requests" },
      handle(onRequestUpdate)
    );
  }

  // ✅ WORK HOURS (🔥 THIS FIXES YOUR ISSUE)
if (onWorkHoursUpdate) {
  newChannel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "work_hours" },
    handle(onWorkHoursUpdate)
  );
}

  // ✅ PRESENCE
  if (onPresenceUpdate) {
    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "request_presence" },
      (payload) => {
        onPresenceUpdate({
          type: payload.eventType,
          new: payload.new,
          old: payload.old,
        });
      }
    );
  }

  // ✅ SUBSCRIBE LAST
  newChannel.subscribe((status) => {
    console.log("Realtime status:", status);

    if (status === "CHANNEL_ERROR") {
      console.error("❌ Realtime error — resetting...");

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }

      isActive = false; // ✅ allow retry

      setTimeout(() => {
initRealtime({
  onEmployeeUpdate,
  onStrikeUpdate,
  onTerminationUpdate,
  onRequestUpdate,
  onPresenceUpdate,
  onWorkHoursUpdate, // 🔥 ADD THIS
});
      }, 1000);
    }
  });

  channel = newChannel;

  // ✅ CLEANUP
  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
    isActive = false;
  };
}