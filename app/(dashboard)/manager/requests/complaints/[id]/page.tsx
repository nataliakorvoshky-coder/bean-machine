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

  import EvidenceVault
  from "@/components/tickets/EvidenceVault";

import OwnerChat
  from "@/components/tickets/OwnerChat";

import OwnerChatSidebar 
  from "@/components/tickets/OwnerChatSidebar";

export default function ComplaintsTicketPage() {

  const params =
    useParams();

  const ticketId =
    params.id as string;

    console.log(
  "PARAMS:",
  params
);

console.log(
  "TICKET ID:",
  ticketId
);

  const [ticket, setTicket] =
    useState<any>(null);


  const [loading, setLoading] =
    useState(true);

    const [
  activeTab,
  setActiveTab
] = useState("chat");

const [
  profile,
  setProfile
] = useState<any>(null);


useEffect(() => {

  loadProfile();

}, []);

async function loadProfile() {

  const {
    data: auth
  } = await supabase
    .auth
    .getUser();

  if (!auth?.user)
    return;

const {
  data
} = await supabase

  .from("profiles")

  .select(`
    *,
    roles (
      id,
      name,
      level
    )
  `)

  .eq(
    "id",
    auth.user.id
  )

  .single();

  setProfile(data);

}

useEffect(() => {

  if (!ticketId)
    return;

  loadTicket();

}, [ticketId]);

  async function loadTicket() {

    setLoading(true);

const {
  data,
  error,
} = await supabase

  .from("complaint_requests")

  .select("*")

  .eq("id", ticketId)

  .maybeSingle();

console.log(
  "LOAD TICKET RESULT:",
  {
    ticketId,
    data,
    error,
  }
);

    setTicket(data);

setLoading(false);
  }

  async function refreshTicket() {

      console.log(
    "REFRESH TICKET"
  );

  const { data } =
    await supabase

.from("complaint_requests")

      .select("*")

      .eq("id", ticketId)

      .maybeSingle();

  if (data) {
    setTicket(data);
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

        "/api/manager/complaints/claim",

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

    // await loadTicket();

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

        "/api/manager/complaints/complete",

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

    // await loadTicket();

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

        "/api/manager/complaints/escalate",

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

// await loadTicket();

  } catch (err) {

    console.error(err);
  }
}

console.log(
  "RENDER END DATE:",
  ticket?.end_date
);

if (loading) {

  return (
    <div className="p-10">
      Loading...
    </div>
  );
}

if (!ticket) {

  return (
    <div className="p-10 text-red-500">
      Ticket not found
    </div>
  );
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

  <div
    className="
      flex
      gap-2
      mb-4
    "
  >

    <button

      onClick={()=>
        setActiveTab(
          "chat"
        )
      }

      className={`
        px-4
        py-2

        rounded-xl

        text-sm
        font-semibold

        ${
          activeTab === "chat"

            ? "bg-emerald-600 text-white"

            : "bg-white border border-emerald-200 text-emerald-700"
        }
      `}
    >
      Chat
    </button>

    <button

      onClick={()=>
        setActiveTab(
          "evidence"
        )
      }

      className={`
        px-4
        py-2

        rounded-xl

        text-sm
        font-semibold

        ${
          activeTab === "evidence"

            ? "bg-emerald-600 text-white"

            : "bg-white border border-emerald-200 text-emerald-700"
        }
      `}
    >
      Evidence Vault
    </button>

{profile?.roles?.name ===
  "admin" && (

<button

  onClick={() =>
    setActiveTab(
      "owner-chat"
    )
  }

  className={`
    px-4
    py-2

    rounded-xl

    text-sm
    font-semibold

    ${
      activeTab === "owner-chat"

        ? "bg-emerald-600 text-white"

        : "bg-white border border-emerald-200 text-emerald-700"
    }
  `}
>
  Owner Chat
</button>

)}

  </div>

{activeTab ===
  "chat" && (

  <TicketChat

    ticketId={ticket.id}

    requestType="complaints"

    senderRole="manager"

    senderName={
      ticket.claimed_by_name
    }

    tableName="complaint_requests"

    onTicketUpdated={
      refreshTicket
    }
  />

)}

{activeTab ===
  "evidence" && (

<EvidenceVault

  complaintId={
    ticket.id
  }

  uploadedByName={
    ticket.claimed_by_name ||
    "Manager"
  }

/>

)}

{activeTab ===
  "owner-chat" && (

<OwnerChat

  complaintId={
    ticket.id
  }

/>

)}

  </div>

{/* RIGHT SIDE */}

<div>

{activeTab === "owner-chat" ? (

  <OwnerChatSidebar

    complaintId={ticket.id}

  />

) : (

  <>

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
              Complaint Ticket
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
    ticket.anonymous
      ? "Anonymous"
      : ticket.employee_name
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
  label="Complaint Type"
  value={
    ticket.complaint_type
  }
/>

<Info
  label="Against"
  value={
    ticket.complaint_against
  }
/>

<Info
  label="Escalation"
  value={
    `Level ${
      ticket.escalation_level || 0
    }`
  }
/>


<Info
  label="Incident Date"
  value={
    ticket.incident_date ||
    "--"
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

      {/* Resolution */}
          <div className="mt-6">

  <div
    className="
      text-sm
      font-semibold
      text-emerald-700
      mb-2
    "
  >
    Requested Resolution
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
    {
      ticket.requested_resolution ||
      "--"
    }
  </div>

   {/* Involved */}

  <div className="mt-6">

  <div
    className="
      text-sm
      font-semibold
      text-emerald-700
      mb-2
    "
  >
    Involved People
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
    {
      ticket.involved_people ||
      "--"
    }
  </div>

   {/* Evidence */}

  {(
  ticket.photo_url ||
  ticket.video_url
) && (

  <div className="mt-6">

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
        mb-2
      "
    >
      Evidence
    </div>

    <div
      className="
        flex
        flex-col
        gap-2
      "
    >

      {ticket.photo_url && (

        <a
          href={ticket.photo_url}
          target="_blank"
          rel="noreferrer"
          className="
            text-emerald-600
            underline
          "
        >
          View Photo
        </a>

      )}

      {ticket.video_url && (

        <a
          href={ticket.video_url}
          target="_blank"
          rel="noreferrer"
          className="
            text-emerald-600
            underline
          "
        >
          View Video
        </a>

      )}

    </div>

  </div>

)}

</div> 

</div> 

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

  requestTable="complaint_requests"

  requestId={ticket.id}

  currentStatus={
    ticket.status
  }

  onSuccess={async ()=>{

    await loadTicket();
  }}
/>

    </div> 

  </>     

)}         

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