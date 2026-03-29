import { supabase } from "@/lib/supabase";

export function initRealtime({
  onEmployeeUpdate,
  onStrikeUpdate,
  onTerminationUpdate,
  onRequestUpdate,
  onPresenceUpdate, // ✅ ADD HERE
}: {
  onEmployeeUpdate?: (payload: any) => void;
  onStrikeUpdate?: (payload: any) => void;
  onTerminationUpdate?: (payload: any) => void;
  onRequestUpdate?: (payload: any) => void;
  onPresenceUpdate?: (payload: any) => void; // ✅ KEEP HERE
}) { 
  if (typeof window === "undefined") return () => {};

  const channel = supabase.channel("global-live");

  const handle = (cb?: Function) => (payload: any) => {
    if (!cb) return;

    cb({
      type: payload.eventType,
      new: payload.new ?? null,
      old: payload.old ?? null,
    });
  };

  if (onEmployeeUpdate) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employees" },
      handle(onEmployeeUpdate)
    );
  }

  if (onStrikeUpdate) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employee_strikes" },
      handle(onStrikeUpdate)
    );
  }

  if (onTerminationUpdate) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "termination_history" },
      handle(onTerminationUpdate)
    );
  }

  if (onRequestUpdate) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "requests" },
      handle(onRequestUpdate)
    );
  }

  if (onPresenceUpdate) {
  channel.on(
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

  channel.subscribe((status) => {
    console.log("Realtime status:", status);
  });

  return () => {
    supabase.removeChannel(channel);
  };
}