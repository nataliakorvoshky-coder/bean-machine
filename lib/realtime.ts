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

  console.log(
    "Subscribing:",
    "employees"
  );

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "employees"
    },
    handle(onEmployeeUpdate)
  );
}


  // ✅ STRIKES
  if (onStrikeUpdate) {

      console.log(
  "Subscribing:",
  "strikes"
);

    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "employee_strikes" },
      handle(onStrikeUpdate)
    );
  }


  // ✅ TERMINATIONS
  if (onTerminationUpdate) {

        console.log(
  "Subscribing:",
  "termination"
);

    newChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "termination_history" },
      handle(onTerminationUpdate)
    );
  }


// ✅ LOA REQUESTS
 if (onRequestUpdate) {

      console.log(
  "Subscribing:",
  "loa_requests"
);

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "loa_requests",
    },
    handle(onRequestUpdate)
  );



  // ✅ HOURS EXCEPTIONS

      console.log(
  "Subscribing:",
  "hours_exception_requests"
);

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "hours_exception_requests",
    },
    handle(onRequestUpdate)
  );


  // ✅ GENERAL REQUESTS

       console.log(
  "Subscribing:",
  "general_requests"
);

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "general_requests",
    },
    handle(onRequestUpdate)
  );

  // ✅ EVENT REQUESTS

        console.log(
  "Subscribing:",
  "event_requests"
);


  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "event_requests",
    },
    handle(onRequestUpdate)
  );

  // ✅ INCIDENT REQUESTS

        console.log(
  "Subscribing:",
  "incident_requests"
);

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "incident_requests",
    },
    handle(onRequestUpdate)
  );

  // ✅ COMPLAINT REQUESTS

        console.log(
  "Subscribing:",
  "complaint_requests"
);

  newChannel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "complaint_requests",
    },
    handle(onRequestUpdate)
  );
}

  // ✅ WORK HOURS (🔥 THIS FIXES YOUR ISSUE)
if (onWorkHoursUpdate) {

      console.log(
  "Subscribing:",
  "work_hours"
);

  newChannel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "work_hours" },
    handle(onWorkHoursUpdate)
  );
}

  // ✅ PRESENCE
  if (onPresenceUpdate) {

        console.log(
  "Subscribing:",
  "request_presence"
);

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
newChannel.subscribe((status, err) => {

  console.log(
    "Realtime status:",
    status,
    err
  );

  if (status === "CLOSED") {

    console.log(
      "🔒 Realtime channel closed"
    );

    return;
  }

  if (

    status === "CHANNEL_ERROR"

    ||

    status === "TIMED_OUT"

  ) {

console.error(
  "❌ REALTIME FAILURE"
);

console.log(
  "STATUS:",
  status
);

console.log(
  "TOPIC:",
  newChannel.topic
);

console.log(
  "STATE:",
  newChannel.state
);

console.log(
  "CHANNEL:",
  newChannel
);

    if (channel) {

      supabase.removeChannel(
        channel
      );

      channel = null;
    }

    isActive = false;

    setTimeout(() => {

      initRealtime({
        onEmployeeUpdate,
        onStrikeUpdate,
        onTerminationUpdate,
        onRequestUpdate,
        onPresenceUpdate,
        onWorkHoursUpdate,
      });

    }, 1000);
  }
});

  channel = newChannel;


  // ✅ CLEANUP
return () => {

  if (channel) {

    supabase.removeChannel(
      channel
    );

    channel = null;
  }

  isActive = false;
};
}