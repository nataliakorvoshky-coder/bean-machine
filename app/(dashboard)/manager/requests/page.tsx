"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import StyledDropdown from "@/components/StyledDropdown";

import StatusBadge
  from "@/components/shared/StatusBadge";

  import {
  getTicketActivityState
} from "@/lib/tickets/getTicketActivityState";

export default function ManagerRequestsPage() {

  const [requests, setRequests] = useState<any[]>([]);

  const [manager, setManager] =
  useState("");

  const [managerId, setManagerId] =
  useState("");

const [note, setNote] =
  useState("");

  const [comment, setComment] =
  useState("");

  const [reassignTo, setReassignTo] =
  useState("");


const [statusFilter, setStatusFilter] =
  useState("All");

  const [
  employeeFilter,
  setEmployeeFilter
] = useState("All");

const [
  claimedFilter,
  setClaimedFilter
] = useState("All");

const [assignedOnly, setAssignedOnly] =
  useState(false);

const [page, setPage] =
  useState(0);

const PAGE_SIZE = 10;

useEffect(() => {

  loadRequests();
  loadManager();

  const hoursChannel = supabase

    .channel(
      "hours-exception-requests"
    )

    .on(
      "postgres_changes",

      {
        event: "*",
        schema: "public",
        table:
          "hours_exception_requests",
      },

      () => {
        loadRequests();
      }
    )

    .subscribe();

  const loaChannel = supabase

    .channel(
      "loa-roa-requests"
    )

    .on(
      "postgres_changes",

      {
        event: "*",
        schema: "public",
        table:
          "loa_requests",
      },

      () => {
        loadRequests();
      }
    )

    .subscribe();

  return () => {

    supabase.removeChannel(
      hoursChannel
    );

    supabase.removeChannel(
      loaChannel
    );
  };

}, []);

async function loadManager() {

  const {
    data: auth
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
      employee_id
    `)

    .eq(
      "id",
      user.id
    )

    .maybeSingle();

  const {
    data: employee
  } = await supabase

    .from("employees")

    .select(`
      name
    `)

    .eq(
      "id",
      profile?.employee_id
    )

    .maybeSingle();

  setManager(

    employee?.name ||

    "Manager"
  );

  setManagerId(
    user.id
  );
}

  async function loadRequests() {

    /*
  GET USER
*/

const {
  data: auth
} = await supabase
  .auth
  .getUser();

const user =
  auth?.user;

if (!user)
  return;

    // HOURS

    const { data: hours } =
      await supabase
        .from("hours_exception_requests")
        .select("*");

    // LOA

    const { data: loa } =
      await supabase
        .from("loa_requests")
        .select("*");

        /*
  LOAD VIEWS
*/

const {
  data: views
} = await supabase

  .from("ticket_views")

  .select("*")

  .eq(
    "user_id",
    user.id
  );

    const merged = [

      ...(hours || []).map((r) => ({
        ...r,
        request_category:
          "Hours Exception",
      })),

      ...(loa || []).map((r) => ({
        ...r,
        request_category:
          "LOA / ROA",
      })),

    ];

    merged.sort((a, b) => {

  const aOverdue =
    isOverdue(a);

  const bOverdue =
    isOverdue(b);

  if (
    aOverdue &&
    !bOverdue
  ) {
    return -1;
  }

  if (
    !aOverdue &&
    bOverdue
  ) {
    return 1;
  }

  return (
    new Date(b.created_at)
      .getTime() -

    new Date(a.created_at)
      .getTime()
  );
});
    /*
  MERGE VIEW DATA
*/

const mergedWithViews =

  merged.map((req) => {

    const requestTable =

      req.request_category ===
      "Hours Exception"

        ? "hours_exception_requests"

        : "loa_requests";

    const view =
      views?.find(

        (v) =>

          v.request_id ===
            req.id

          &&

          v.request_table ===
            requestTable
      );

    return {

      ...req,

      last_viewed_at:
        view?.last_viewed_at,
    };
  });

setRequests(
  mergedWithViews
);
  }

  async function claim(req: any) {

  const table =
    req.request_category ===
    "Hours Exception"
      ? "hours_exception_requests"
      : "loa_requests";

  await fetch(
    "/api/requests/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        table,

        id: req.id,

updates: {

  status:
    "In Progress",

  claimed_by_id:
    managerId,

  claimed_by_name:
    manager,

  claimed_at:
    new Date().toISOString(),

          notes_history: [

            ...(req.notes_history || []),

            {
              text:
                `Claimed by ${manager}`,

              by:
                manager,

              at:
                new Date().toISOString(),

              type:
                "Claimed",
            },

          ],

        },

      }),
    }
  );

  loadRequests();
}

async function approve(req: any) {

  const table =
    req.request_category ===
    "Hours Exception"
      ? "hours_exception_requests"
      : "loa_requests";

  await fetch(
    "/api/requests/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        table,

        id: req.id,

        updates: {

          status:
            "Approved",

          answered_by:
            manager,

          answered_at:
            new Date().toISOString(),

          notes_history: [

            ...(req.notes_history || []),

            {
              text:
                note ||
                "Request approved",

              by:
                manager,

              at:
                new Date().toISOString(),

              type:
                "Approved",
            },

          ],

        },

      }),
    }
  );


  setNote("");

  loadRequests();
}

async function deny(req: any) {

  const table =
    req.request_category ===
    "Hours Exception"
      ? "hours_exception_requests"
      : "loa_requests";

  await fetch(
    "/api/requests/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        table,

        id: req.id,

        updates: {

          status:
            "Denied",

          answered_by:
            manager,

          answered_at:
            new Date().toISOString(),

          notes_history: [

            ...(req.notes_history || []),

            {
              text:
                note ||
                "Request denied",

              by:
                manager,

              at:
                new Date().toISOString(),

              type:
                "Denied",
            },

          ],

        },

      }),
    }
  );

  setNote("");

  loadRequests();
}

async function addComment(req: any) {

  if (!comment.trim()) return;

  const table =
    req.request_category ===
    "Hours Exception"
      ? "hours_exception_requests"
      : "loa_requests";

  await fetch(
    "/api/requests/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        table,

        id: req.id,

        updates: {

          notes_history: [

            ...(req.notes_history || []),

            {
              text: comment,

              by: manager,

              at:
                new Date().toISOString(),

              type:
                "Comment",
            },

          ],

        },

      }),
    }
  );

  setComment("");

  loadRequests();
}

async function reassign(req: any) {

  if (!reassignTo.trim()) return;

  const table =
    req.request_category ===
    "Hours Exception"
      ? "hours_exception_requests"
      : "loa_requests";

  await fetch(
    "/api/requests/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        table,

        id: req.id,

        updates: {

          claimed_by:
            reassignTo,

          notes_history: [

            ...(req.notes_history || []),

            {
              text:
                `Reassigned to ${reassignTo}`,

              by:
                manager,

              at:
                new Date().toISOString(),

              type:
                "Reassigned",
            },

          ],

        },

      }),
    }
  );

  setReassignTo("");

  loadRequests();
}

function priorityColor(priority: string) {

  switch (priority) {

    case "Urgent":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Low":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

function isOverdue(req: any) {

if (
  req.status === "Approved" ||
  req.status === "Denied" ||
  req.status === "Completed"
) {
  return false;
}

  const activityDate =

    req.last_activity_at ||

    req.created_at;

  const activity =
    new Date(activityDate)
      .getTime();

  const now =
    Date.now();

  const hours =
    (now - activity) /
    (1000 * 60 * 60);

  return hours >= 24;
}

  const employeeOptions = [

  "All",

  ...new Set(
    requests.map(
      (r)=>
        r.employee_name
    )
  ),
];

const claimedOptions = [

  "All",

  ...new Set(

    requests

.map(
  (r)=>
    r.claimed_by_name
)

      .filter(Boolean)
  ),
];

  const filteredRequests = requests.filter((req) => {

  const matchesStatus =

    statusFilter === "All"
      ? true
      : req.status === statusFilter;

  const matchesAssigned =

assignedOnly
  ? req.claimed_by_id === managerId
  : true;

      const matchesEmployee =

  employeeFilter ===
  "All"

    ? true

    : req.employee_name ===
      employeeFilter;

const matchesClaimed =

  claimedFilter ===
  "All"

    ? true

: req.claimed_by_name ===
  claimedFilter;

return (

  matchesStatus &&

  matchesAssigned &&

  matchesEmployee &&

  matchesClaimed
);
});

const totalPages = Math.ceil(
  filteredRequests.length /
  PAGE_SIZE
);

const paginatedRequests =
  filteredRequests.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const pendingCount =
  requests.filter(
    (r) => r.status === "Pending"
  ).length;

const progressCount =
  requests.filter(
    (r) => r.status === "In Progress"
  ).length;

const approvedCount =
  requests.filter(
    (r) => r.status === "Approved"
  ).length;

const deniedCount =
  requests.filter(
    (r) => r.status === "Denied"
  ).length;

  const overdueCount =
  requests.filter((r) =>
    isOverdue(r)
  ).length;

  const completedCount =
  requests.filter(
    (r) => r.status === "Completed"
  ).length;

const myClaimsCount =
  requests.filter(
    (r) =>

      r.claimed_by_id ===
      managerId

  ).length;

  return (
    <div className="
      max-w-7xl mx-auto
      py-10 px-4
    ">

      <h1 className="
        text-3xl font-bold
        text-emerald-700 mb-8
      ">
        Requests Dashboard
      </h1>

<div className="
  flex justify-center
  flex-wrap
  gap-3
  mb-8
">

  {/* PENDING */}

<div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

    <div className="
      text-[11px]
uppercase tracking-wide
text-emerald-500
font-semibold
mb-1
    ">
      Pending
    </div>

    <div className="
text-lg font-bold
text-emerald-700
leading-none
    ">
      {pendingCount}
    </div>

  </div>

  {/* IN PROGRESS */}

 <div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

    <div className="
      text-[11px]
uppercase tracking-wide
text-yellow-500
font-semibold
mb-1
    ">
      In Progress
    </div>

    <div className="
      text-lg font-bold
      text-yellow-700
      leading-none
    ">
      {progressCount}
    </div>

  </div>

  {/* APPROVED */}

 <div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

    <div className="
    text-[11px]
    uppercase tracking-wide 
     text-emerald-500
     font-semibold
     mb-1
    ">
      Approved
    </div>

    <div className="
      text-1g font-bold
      text-emerald-700
      leading-none
    ">
      {approvedCount}
    </div>

  </div>

  {/* DENIED */}

 <div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

    <div className="
    text-[11px]
    uppercase tracking-wide
   text-red-500
   font-semibold
    mb-1
    ">
      Denied
    </div>

    <div className="
      text-1g font-bold
      text-red-700
      leading-none
    ">
      {deniedCount}
    </div>

  </div>

  {/* OverDue*/}

 <div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

  <div className="
  text-[11px]
  uppercase tracking-wide
 text-red-500 
 font-semibold
 mb-1
  ">

    Overdue
  </div>

  <div className="
    text-1g font-bold
    text-red-700
    leading-none
  ">
    {overdueCount}
  </div>

</div>

{/* COMPLETED */}

<div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

  <div className="
    text-[11px]
    uppercase tracking-wide
    text-blue-500
    font-semibold
    mb-1
  ">
    Completed
  </div>

  <div className="
    text-lg font-bold
    text-blue-700
    leading-none
  ">
    {completedCount}
  </div>

</div>


  {/* MY CLAIMS */}

 <div className="
  bg-white/80
  border border-emerald-100
  rounded-xl
  px-3 py-2
  w-[105px]
  shadow-sm
">

    <div className="
    text-[11px]
    uppercase tracking-wide
   text-blue-500
   font-semibold
    mb-1
    ">
      My Claims
    </div>

    <div className="
      text-1g font-bold
      text-blue-700
      leading-none
    ">
      {myClaimsCount}
    </div>

  </div>

</div>

<div className="
  flex flex-wrap
  items-center
  gap-3
  mb-8
">


{/* STATUS */}

<StyledDropdown

  placeholder="All Statuses"

  value={statusFilter}

  onChange={(value) => {

    setStatusFilter(value);

    setPage(0);
  }}

  width="180px"

  options={[

    {
      id: "All",
      name: "All Statuses",
    },

    {
      id: "Pending",
      name: "Pending",
    },

    {
      id: "In Progress",
      name: "In Progress",
    },

    {
      id: "Approved",
      name: "Approved",
    },

    {
      id: "Denied",
      name: "Denied",
    },

    {
  id: "Completed",
  name: "Completed",
},

  ]}
/>

{/* EMPLOYEE */}

<StyledDropdown

  placeholder="All Employees"

  value={employeeFilter}

  onChange={(value) => {

    setEmployeeFilter(value);

    setPage(0);
  }}

  width="220px"

  options={employeeOptions.map(
    (employee) => ({

      id: employee,

      name: employee,
    })
  )}
/>

{/* CLAIMED */}

<StyledDropdown

  placeholder="All Claims"

  value={claimedFilter}

  onChange={(value) => {

    setClaimedFilter(value);

    setPage(0);
  }}

  width="220px"

  options={claimedOptions.map(
    (claimed) => ({

      id: claimed,

      name:

        claimed === "All"

          ? "All Claims"

          : claimed,
    })
  )}
/>

  {/* ASSIGNED */}

  <button

    onClick={() => {

      setAssignedOnly(
        !assignedOnly
      );

      setPage(0);
    }}

    className={`
      px-5 py-3

      rounded-xl

      text-sm
      font-semibold

      transition-all

      ${
        assignedOnly

          ? `
            bg-emerald-600
            text-white
          `

          : `
            bg-white/80
            border
            border-emerald-200
            text-emerald-700
          `
      }
    `}
  >

    Assigned To Me

  </button>

</div>

      <div className="
        flex flex-col gap-4
      ">

        <div

  className="
    hidden
    md:grid

    grid-cols-[180px_180px_120px_180px_120px_160px_180px]

    gap-4

    px-6
    py-2.5

    text-[15px]
    uppercase
    tracking-wide

    text-emerald-700
    font-semibold
  "
>

  <div>
    Employee
  </div>

  <div>
    Request Type
  </div>

  <div>
    Status
  </div>

  <div>
    Subject
  </div>

  <div>
    Priority
  </div>

  <div>
    Claimed By
  </div>

  <div>
    Submitted
  </div>

</div>

{paginatedRequests.map((req) => {

const {
  updatedRecently
} = getTicketActivityState(

  req.last_activity_at,

  req.last_viewed_at
);

console.log({
  subject: req.subject,
  activity: req.last_activity_at,
  viewed: req.last_viewed_at,
  updatedRecently,
});

  return (


<div

  key={req.id}

  className={`

    bg-white

    border
    border-emerald-100

    rounded-2xl

    shadow

    overflow-hidden

    transition-all

    ${updatedRecently

      ? "animate-soft-pulse"

      : ""

    }

  `}
>

  {/* HEADER */}

<Link

  href={

    req.request_category ===
    "Hours Exception"

      ? `/manager/requests/hours-exception/${req.id}`

      : `/manager/requests/loa-roa/${req.id}`
  }

  className="
    block
  "
>

  <div

    className="
      px-6 py-4

      hidden
      md:grid

      grid-cols-[180px_180px_120px_180px_120px_160px_180px]

      gap-4
      items-center

      hover:bg-emerald-50

      transition-all
      cursor-pointer
    "
  >

    {/* EMPLOYEE */}

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
      "
    >
      {req.employee_name}
    </div>

    {/* TYPE */}

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
      "
    >
      {req.request_category}
    </div>

    {/* STATUS */}

    <div>

 <StatusBadge
  status={req.status}
/>

    </div>

    {/* SUBJECT */}

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
      "
    >
      {req.subject ||
        "No Subject"}
    </div>

    {/* PRIORITY */}

    <div
      className="
        text-sm
        text-emerald-700
      "
    >
      {req.priority ||
        "--"}
    </div>

    {/* CLAIMED */}

    <div
      className="
        text-sm
        text-emerald-700
      "
    >
{req.claimed_by_name ||
  "--"}
    </div>

    {/* DATE */}

    <div
      className="
        text-sm
        text-emerald-500
      "
    >
      {new Date(
        req.created_at
      ).toLocaleString()}
    </div>

  </div>

</Link>

</div>

          );

})}

        <div className="
  flex justify-center
  items-center gap-4
  mt-8
">

  <button

    onClick={() =>
      setPage((p) =>
        Math.max(p - 1, 0)
      )
    }

    disabled={page === 0}

    className="
      px-4 py-2
      rounded-xl
      border border-emerald-300
      text-emerald-700
      disabled:opacity-40
    "
  >
    Prev
  </button>

  <div className="
    text-sm font-semibold
    text-emerald-700
  ">
    Page
    {" "}
    {page + 1}
    {" / "}
    {totalPages || 1}
  </div>

  <button

    onClick={() =>
      setPage((p) =>
        Math.min(
          p + 1,
          totalPages - 1
        )
      )
    }

    disabled={
      page >= totalPages - 1
    }

    className="
      px-4 py-2
      rounded-xl
      border border-emerald-300
      text-emerald-700
      disabled:opacity-40
    "
  >
    Next
  </button>

</div>

      </div>

    </div>
  );
}