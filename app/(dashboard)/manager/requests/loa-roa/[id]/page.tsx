"use client";

import {
  useEffect,
  useState,
} from "react";

import StatusBadge
  from "@/components/shared/StatusBadge";

import {
  useParams,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase";

import TicketChat
  from "@/components/tickets/TicketChat";

  import AdminOverridePanel
  from "@/components/admin/AdminOverridePanel";

  


export default function LOATicketPage() {

  const params =
    useParams();

  const ticketId =
    params.id as string;

  const [ticket, setTicket] =
    useState<any>(null);


  const [loading, setLoading] =
    useState(true);


useEffect(() => {

  if (!ticketId)
    return;

  loadTicket();

}, [ticketId]);

  async function loadTicket() {

    setLoading(true);

    const { data } =
      await supabase

        .from(
          "loa_requests"
        )

        .select("*")

        .eq("id", ticketId)

        .maybeSingle();

    setTicket(data);

setLoading(false);
  }


  async function approveTicket() {

  try {

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    username,
    employee_id
  `)

  .eq("id", user.id)

  .maybeSingle();

const {
  data: employee
} = await supabase

  .from("employees")

  .select("name")

  .eq(
    "id",
    profile?.employee_id
  )

  .maybeSingle();

    const res =
      await fetch(

        "/api/manager/loa/approve",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

body: JSON.stringify({

  ticketId,

  managerId:
    user.id,

managerName:
  employee?.name ||
  profile?.username ||
  ticket.employee_name ||
  "Manager",

}),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    /*
      UPDATE LOCAL UI
    */

    setTicket((prev: any)=>({

      ...prev,

      status:
        "Approved",

approved_by_id:
  user.id,


approved_by_name:
  employee?.name ||
  "Manager",
  
    }));

    await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

  if (loading) {

    return (

      <div className="p-10">

        Loading ticket...

      </div>

    );
  }

  if (!ticket) {

    return (

      <div className="p-10">

        Ticket not found.

      </div>

    );
  }

  async function denyTicket() {

  try {

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    username,
    employee_id
  `)

  .eq("id", user.id)

  .maybeSingle();

const {
  data: employee
} = await supabase

  .from("employees")

  .select("name")

  .eq(
    "id",
    profile?.employee_id
  )

  .maybeSingle();

    const res =
      await fetch(

        "/api/manager/loa/deny",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

body: JSON.stringify({

  ticketId,

  managerId:
    user.id,

managerName:
  employee?.name ||
  profile?.username ||
  ticket.employee_name ||
  "Manager",
}),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    /*
      UPDATE LOCAL UI
    */

    setTicket((prev: any)=>({

      ...prev,

      status:
        "Denied",

denied_by_id:
  user.id,

denied_by_name:
  employee?.name ||
  "Manager",
  

    }));

    await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

async function claimTicket() {

  try {

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    username,
    employee_id
  `)

  .eq("id", user.id)

  .maybeSingle();

const {
  data: employee
} = await supabase

  .from("employees")

  .select("name")

  .eq(
    "id",
    profile?.employee_id
  )

  .maybeSingle();

    const res =
      await fetch(

        "/api/manager/loa/claim",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

body: JSON.stringify({

  ticketId,

  managerId:
    user.id,

managerName:
  employee?.name ||
  profile?.username ||
  ticket.employee_name ||
  "Manager",
}),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    /*
      UPDATE LOCAL UI
    */

    setTicket((prev: any)=>({

      ...prev,

      status:
        "In Progress",

claimed_by_id:
  user.id,

claimed_by_name:
  employee?.name ||
  "Manager",
  
    }));

    await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

async function completeTicket() {

  try {

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

    const {
      data: profile
    } = await supabase

      .from("profiles")

      .select(`
        username,
        employee_id
      `)

      .eq("id", user.id)

      .maybeSingle();

    const {
      data: employee
    } = await supabase

      .from("employees")

      .select("name")

      .eq(
        "id",
        profile?.employee_id
      )

      .maybeSingle();

    const res =
      await fetch(

        "/api/manager/loa/complete",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            ticketId,

            managerId:
              user.id,

            managerName:
              employee?.name ||

              profile?.username ||

              "Manager",
          }),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    setTicket((prev: any)=>({

      ...prev,

      status:
        "Completed",

      completed_by_id:
        user.id,

      completed_by_name:
        employee?.name,

      completed_at:
        new Date()
          .toISOString(),
    }));

    await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

async function escalateTicket() {

  try {

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    username,
    employee_id
  `)

  .eq("id", user.id)

  .maybeSingle();

const {
  data: employee
} = await supabase

  .from("employees")

  .select("name")

  .eq(
    "id",
    profile?.employee_id
  )

  .maybeSingle();

    const res =
      await fetch(

        "/api/manager/loa/escalate",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

body: JSON.stringify({

  ticketId,

  managerId:
    user.id,

managerName:
  employee?.name ||
  profile?.username ||
  ticket.employee_name ||
  "Manager",
}),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    /*
      UPDATE LOCAL UI
    */

setTicket((prev: any)=>({

  ...prev,

  escalated: true,

  escalation_level:
    data.escalation_level,
}));

await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

return (

  <div
    className="
     w-full
max-w-none
      py-10
      px-6
    "
  >

<div
  className="
    grid
    lg:grid-cols-[minmax(0,4.5fr)_380px]
    gap-6
    items-start
  "
>

  {/* LEFT */}

  <div className="w-full min-w-0">

    <TicketChat

      ticketId={ticket.id}

      requestType="loa"

      senderRole="manager"

      senderName={
        ticket.claimed_by_name
      }

      tableName="loa_requests"
    />

  </div>

  {/* RIGHT SIDE */}

  <div>

      {/* TOP */}

      <div
        className="
          bg-white

          border
          border-emerald-100

          rounded-2xl
          shadow-sm

          p-6
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            mb-6
          "
        >

          <div>

            <div
              className="
                text-3xl
                font-bold
                text-emerald-700
              "
            >
              {ticket.subject}
            </div>

            <div
              className="
                text-sm
                text-emerald-500
                mt-1
              "
            >
              LOA / ROA Ticket
            </div>

          </div>

<StatusBadge
  status={ticket.status}
/>

        </div>

        {/* INFO GRID */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
            mb-6
          "
        >

          <Info
            label="Employee"
            value={
              ticket.employee_name
            }
          />

          <Info
            label="Created"
            value={
              new Date(
                ticket.created_at
              ).toLocaleString()
            }
          />

<Info
  label="Escalation"
  value={
    `Level ${ticket.escalation_level || 0}`
  }
/>

          <Info
            label="Claimed By"
            value={
              ticket.claimed_by_name ||
              "--"
            }
          />

<Info
  label="Completed"
  value={
    ticket.completed_at
      ? new Date(
          ticket.completed_at
        ).toLocaleString()
      : "--"
  }
/>

        </div>

        {/* DESCRIPTION */}

        <div>

          <div
            className="
              text-sm
              font-semibold
              text-emerald-700
              mb-2
            "
          >
            Description
          </div>

          <div
            className="
              bg-emerald-50

              border
              border-emerald-100

              rounded-2xl

              p-5

              text-sm
              text-emerald-800

              whitespace-pre-wrap
            "
          >
            {ticket.description}
          </div>

{/* MANAGER ACTIONS */}

<div className="mt-8">

  <div
    className="
      text-[11px]
      uppercase
      tracking-[0.15em]

      text-emerald-500

      font-semibold

      mb-4
    "
  >
    Manager Actions
  </div>

<div
  className="
    grid
    grid-cols-2
    gap-3

    [&>*:last-child]:col-span-2
    [&>*:last-child]:mx-auto
    [&>*:last-child]:w-full
    [&>*:last-child]:max-w-[220px]
  "
>

<button

  onClick={approveTicket}

  className="
    h-11

    rounded-xl

    border
    border-emerald-200

    bg-emerald-50
    hover:bg-emerald-100

    text-sm
    font-medium
    text-emerald-700

    transition-all
  "
>
  Approve
</button>

    {/* DENY */}

<button

  onClick={denyTicket}

  className="
    h-11

    rounded-xl

    border
    border-red-200

    bg-red-50
    hover:bg-red-100

    text-sm
    font-medium
    text-red-600

    transition-all
  "
>
  Deny
</button>

    {/* CLAIM */}

<button

  onClick={claimTicket}

  className="
    h-11

    rounded-xl

    border
    border-amber-200

    bg-amber-50
    hover:bg-amber-100

    text-sm
    font-medium
    text-amber-700

    transition-all
  "
>
  Claim
</button>

    {/* ESCALATE */}

{ticket?.escalation_level < 2 && (

<button

  onClick={escalateTicket}

  className="
    h-11

    rounded-xl

    border
    border-purple-200

    bg-purple-50
    hover:bg-purple-100

    text-sm
    font-medium
    text-purple-700

    transition-all
  "
>
  Escalate
</button>

)}

 {/* Complete */}

<button

  onClick={completeTicket}

  className="
    h-11

    rounded-xl

    border
    border-blue-200

    bg-blue-50
    hover:bg-blue-100

    text-sm
    font-medium
    text-blue-700

    transition-all
  "
>
  Complete
</button>

  </div>

</div>

<AdminOverridePanel

  requestTable="
    loa_requests
  "

  requestId={ticket.id}

  currentStatus={
    ticket.status
  }

  onSuccess={async ()=>{

    await loadTicket();
  }}
/>

        </div>

      </div>

    </div>

  </div>

</div>

  );
}

function Info({
  label,
  value,
}: any) {

  return (

    <div
      className="
        bg-emerald-50

        border
        border-emerald-100

        rounded-2xl

        p-4
      "
    >

      <div
        className="
          text-xs
          uppercase
          tracking-wide

          text-emerald-500

          mb-1
        "
      >
        {label}
      </div>

      <div
        className="
          text-sm
          font-semibold
          text-emerald-700
        "
      >
    
        {value || "--"}
      </div>

    </div>

  );
}