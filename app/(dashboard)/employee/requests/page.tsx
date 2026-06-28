"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker";
import StatusBadge
  from "@/components/shared/StatusBadge";
import {
  getTicketActivityState
} from "@/lib/tickets/getTicketActivityState";

const requestTypes = [

  {
    title: "Hours Exception",

    description:
      "Missed Hours and Concerns.",

    href:
      "/employee/requests/hours-exception",
  },

  {
    title: "LOA / ROA",

    description:
      "Leave of absence requests.",

    href:
      "/employee/requests/loa-roa",
  },

  {
  title: "Complaints",

  description:
    "Workplace complaints and concerns",

  href:
    "/employee/requests/complaints",
},

{
  title: "Incidents",

  description:
    "Safety incidents, accidents, or workplace events.",

  href:
    "/employee/requests/incidents",
},

{
  title: "General",

  description:
    "General requests, questions, or miscellaneous issues.",

  href:
    "/employee/requests/general",
},

{
  title: "Events",

  description:
    "Event requests, scheduling, or planning submissions.",

  href:
    "/employee/requests/events",
},

];

export default function EmployeeRequestsHub() {

  const [requests, setRequests] = useState<any[]>([]);

  const [typeFilter, setTypeFilter] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("");

const [fromDate, setFromDate] =
  useState("");

const [toDate, setToDate] =
  useState("");

  const [
  activeTab,
  setActiveTab
] = useState<

  "my" |
  "owner"

>("my");

const [
  ownerRequests,
  setOwnerRequests
] = useState<any[]>([]);

const [
  ownerUnreadCount,
  setOwnerUnreadCount
] = useState(0);

const [
  currentPage,
  setCurrentPage
] = useState(1);

const ITEMS_PER_PAGE = 10;

useEffect(() => {

  setCurrentPage(1);

}, [

  activeTab,

  typeFilter,

  statusFilter,

  fromDate,

  toDate

]);

useEffect(() => {

  loadRequests();

  const hoursChannel = supabase

    .channel(
      "employee-hours-requests"
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
      "employee-loa-requests"
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

    const complaintChannel = supabase

  .channel(
    "employee-complaint-requests"
  )

  .on(
    "postgres_changes",

    {
      event: "*",
      schema: "public",
      table:
        "complaint_requests",
    },

    () => {
      loadRequests();
    }
  )

  .subscribe();

  const incidentChannel = supabase

  .channel(
    "employee-incident-requests"
  )

  .on(
    "postgres_changes",

    {
      event: "*",
      schema: "public",
      table:
        "incident_requests",
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

    supabase.removeChannel(
  complaintChannel
);

supabase.removeChannel(
  incidentChannel
);

  };

}, []);

  async function loadRequests() {

    const { data: auth } =
      await supabase.auth.getUser();

    const user = auth?.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select(`
        employees (
          id,
          name
        )
      `)
      .eq("id", user.id)
      .single();

    const employeeData = Array.isArray(
      profile?.employees
    )
      ? profile.employees[0]
      : profile?.employees;

    if (!employeeData?.id) return;

    // HOURS EXCEPTIONS

    const { data: hours } = await supabase
      .from("hours_exception_requests")
      .select("*")
      .eq(
        "employee_id",
        employeeData.id
      );

    // LOA / ROA

    const { data: loa } = await supabase
      .from("loa_requests")
      .select("*")
      .eq(
        "employee_id",
        employeeData.id
      );

      // Complaints

      const {
  data: complaints
} = await supabase

  .from(
    "complaint_requests"
  )

  .select("*")

  .eq(
    "employee_id",
    employeeData.id
  );

  // Incidents

  const {
  data: incidents
} = await supabase

  .from(
    "incident_requests"
  )

  .select("*")

  .eq(
    "employee_id",
    employeeData.id
  );

// Owner Request

  const {
  data: memberships
} = await supabase

  .from(
    "owner_chat_members"
  )

  .select(`
    complaint_id
  `)

  .eq(
    "employee_id",
    employeeData.id
  );

  const ownerComplaintIds =

  memberships?.map(
    x => x.complaint_id
  ) || [];

let ownerComplaints = [];

if (
  ownerComplaintIds.length > 0
) {

  const {
    data
  } = await supabase

    .from(
      "complaint_requests"
    )

    .select("*")

    .in(
      "id",
      ownerComplaintIds
    );

ownerComplaints =

  (data || []).filter(

    complaint =>

      complaint.status !==
      "Completed"

  );
}

const ownerRequestsWithReadData = [];

let unreadCount = 0;

for (const complaint of ownerComplaints) {

  const {
    data: latestMessage
  } = await supabase

    .from(
      "owner_chat_messages"
    )

    .select(`
      created_at
    `)

    .eq(
      "complaint_id",
      complaint.id
    )

    .order(
      "created_at",
      {
        ascending: false
      }
    )

    .limit(1)

    .maybeSingle();

  const {
    data: readRecord
  } = await supabase

    .from(
      "owner_chat_reads"
    )

    .select(`
      last_read_at
    `)

    .eq(
      "complaint_id",
      complaint.id
    )

    .eq(
      "employee_id",
      employeeData.id
    )

    .maybeSingle();

  const latestMessageDate =

    latestMessage?.created_at

      ? new Date(
          latestMessage.created_at
        )

      : null;

  const lastReadDate =

    readRecord?.last_read_at

      ? new Date(
          readRecord.last_read_at
        )

      : null;

  const isUnread =

    latestMessageDate && (

      !lastReadDate ||

      latestMessageDate >
      lastReadDate

    );

  if (isUnread) {

    unreadCount++;

  }

  ownerRequestsWithReadData.push({

  ...complaint,

  request_type:
    "Owner Complaint",

  is_owner_chat:
    true,

  last_viewed_at:
    readRecord?.last_read_at,

  last_activity_at:
    latestMessage?.created_at ||

    complaint.updated_at ||

    complaint.created_at,

});

}

setOwnerRequests(
  ownerRequestsWithReadData
);

setOwnerUnreadCount(
  unreadCount
);

      /*
  LOAD TICKET VIEWS
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
    request_type:
      "Hours Exception",
  })),

  ...(loa || []).map((r) => ({
    ...r,
    request_type:
      "LOA / ROA",
  })),

  ...(complaints || []).map((r) => ({
    ...r,
    request_type:
      "Complaint",
  })),

  ...(incidents || []).map((r) => ({
  ...r,
  request_type:
    "Incident",
})),

];

    merged.sort((a, b) => {

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });

    /*
  MERGE VIEW DATA
*/

const mergedWithViews =

  merged.map((req) => {

let requestTable =
  "loa_requests";

if (
  req.request_type ===
  "Hours Exception"
) {

  requestTable =
    "hours_exception_requests";
}

if (
  req.request_type ===
  "Complaint"
) {

  requestTable =
    "complaint_requests";
}

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

  const completedCount =
  requests.filter(
    (r) => r.status === "Completed"
  ).length;

const typeOptions = [

  {
    id: "",
    name: "All Types",
  },

  {
    id: "Hours Exception",
    name: "Hours Exception",
  },

  {
    id: "LOA / ROA",
    name: "LOA / ROA",
  },

  {
    id: "Complaint",
    name: "Complaint",
  },

  {
  id: "Incident",
  name: "Incident",
},

];

const statusOptions = [

  {
    id: "",
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

];

const displayedRequests =

  activeTab === "my"

    ? requests

    : ownerRequests;

const filteredRequests = displayedRequests.filter((req) => {

  const matchesType =

    !typeFilter ||

    req.request_type === typeFilter;

  const matchesStatus =

    !statusFilter ||

    req.status === statusFilter;

  const requestDate =
    new Date(req.created_at);

  const matchesFromDate =

    !fromDate ||

    requestDate >=
      new Date(fromDate);

  const matchesToDate =

    !toDate ||

    requestDate <=
      new Date(
        `${toDate}T23:59:59`
      );

  return (
    matchesType &&
    matchesStatus &&
    matchesFromDate &&
    matchesToDate
  );
});

const totalPages = Math.max(

  1,

  Math.ceil(

    filteredRequests.length /

    ITEMS_PER_PAGE

  )

);

const paginatedRequests =

  filteredRequests.slice(

    (currentPage - 1) *
      ITEMS_PER_PAGE,

    currentPage *
      ITEMS_PER_PAGE

  );

  return (
    <div className="
      max-w-6xl mx-auto py-10 px-4
    ">

      <h1 className="
        text-2xl font-bold
        text-emerald-700 mb-8
      ">
        Requests Center
      </h1>



<div className="
  flex justify-center
  flex-wrap
  gap-3
  mb-8
">


<div className="
  flex flex-wrap items-center
  gap-3 mb-6
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
    border border-yellow-100
    rounded-xl
    px-3 py-2
    w-[105px]
    shadow-sm
  ">

    <div className="
      text-[11px]
      uppercase tracking-wide
      text-yellow-600
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
      text-lg font-bold
      text-emerald-700
      leading-none
    ">
      {approvedCount}
    </div>

  </div>

  {/* DENIED */}

  <div className="
    bg-white/80
    border border-red-100
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
      text-lg font-bold
      text-red-700
      leading-none
    ">
      {deniedCount}
    </div>

  </div>

  {/* COMPLETED */}

<div className="
  bg-white/80
  border border-blue-100
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

</div>

</div>

      {/* REQUEST TYPES */}

      <div className="
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  gap-4
  mb-8
">

        {requestTypes.map((item) => (

          <Link
            key={item.href}

            href={item.href}

className="
  bg-white
  border border-emerald-100
  rounded-xl
  shadow-sm
  px-5 py-4
  hover:shadow
  hover:-translate-y-0.5
  transition-all
"
          >

            <div className="
  text- font-bold
  text-emerald-700 mb-1
">
              {item.title}
            </div>

            <div className="
  text-[13px]
  leading-snug
  text-emerald-600
">
              {item.description}
            </div>

          

          </Link>

        ))}

      </div>

      {/* FILTERS */}

<div
  className="
    flex
    flex-wrap

    justify-center

    items-center

    gap-3

    mb-8
  "
>

  {/* TYPE */}

  <div>

    <div className="
      text-xs font-semibold
      text-emerald-600 mb-2
    ">
      TYPE
    </div>

    <StyledDropdown
      placeholder="All Types"
      options={typeOptions}
      value={typeFilter}
      onChange={setTypeFilter}
      width="220px"
    />

  </div>

  {/* STATUS */}

  <div>

    <div className="
      text-xs font-semibold
      text-emerald-600 mb-2
    ">
      STATUS
    </div>

    <StyledDropdown
      placeholder="All Statuses"
      options={statusOptions}
      value={statusFilter}
      onChange={setStatusFilter}
      width="220px"
    />

  </div>

  {/* FROM */}

  <div>

    <div className="
      text-xs font-semibold
      text-emerald-600 mb-2
    ">
      FROM DATE
    </div>

    <div className="w-[180px]">
      <StyledDatePicker
        value={fromDate}
        onChange={setFromDate}
      />
    </div>

  </div>

  {/* TO */}

  <div>

    <div className="
      text-xs font-semibold
      text-emerald-600 mb-2
    ">
      TO DATE
    </div>

    <div className="w-[180px]">
      <StyledDatePicker
        value={toDate}
        onChange={setToDate}
      />
    </div>

  </div>

</div>

  {/* Tickets*/}
<div
  className="
    flex
    gap-3
    mb-6
  "
>

  <button

    onClick={() =>
      setActiveTab("my")
    }

    className={

      activeTab === "my"

        ? `
          px-5 py-2
          rounded-xl
          bg-emerald-600
          text-white
          font-semibold
        `

        : `
          px-5 py-2
          rounded-xl
          bg-white
          border
          border-emerald-100
          text-emerald-700
        `
    }
  >

    My Requests

  </button>

  <button

    onClick={() =>
      setActiveTab("owner")
    }

    className={

      activeTab === "owner"

        ? `
          px-5 py-2
          rounded-xl
          bg-purple-600
          text-white
          font-semibold
        `

        : `
          px-5 py-2
          rounded-xl
          bg-white
          border
          border-purple-100
          text-purple-700
        `
    }
  >

    <div
  className="
    flex
    items-center
    gap-2
  "
>

  <span>
    🐼 Owner Requests
  </span>

  {ownerUnreadCount > 0 && (

    <div
      className="
        min-w-[20px]
        h-5

        px-2

        rounded-full

        bg-red-500

        text-white

        text-[11px]
        font-bold

        flex
        items-center
        justify-center
      "
    >

      {ownerUnreadCount}

    </div>

  )}

</div>

  </button>

</div>

{/* TABLE HEADER */}

<div
  className="
    hidden
    md:grid

    grid-cols-[220px_120px_150px_120px_150px_180px]

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
    Request Type
  </div>

  <div className="pl-3">
    Status
  </div>

<div className="-ml-3">
  Subject
</div>

<div className="-ml-5">
  Priority
</div>

<div className="-ml-5">
  Answered By
</div>

  <div className="pl-1">
    Submitted
  </div>

</div>

  <div
    className="
      flex
      flex-col
      gap-3
    "
  >

{filteredRequests.length === 0 && (

  activeTab === "my" ? (

    <div
      className="
        bg-white
        rounded-xl
        border
        border-emerald-100
        shadow
        p-10
        text-center
        text-emerald-500
      "
    >
      No requests yet.
    </div>

  ) : (

 <div
  className="
    flex
    flex-col
    items-center
    justify-center

    py-20
  "
>

  <img
    src="/mascots/panda-laptop.png"
    alt="Panda"

    className="
      w-[320px]
      h-auto

      object-contain

      mb-4
    "
  />

  <div
    className="
      text-2xl
      font-bold

      text-emerald-700
    "
  >
    No Owner Requests
  </div>

</div>

  )

)}

{paginatedRequests.map((req) => {

const {
  updatedRecently
} = getTicketActivityState(

  req.last_activity_at,

  req.last_viewed_at
);

  return (

  <Link

href={

  req.request_type ===
    "Hours Exception"

    ? `/employee/requests/hours-exception/${req.id}`

: req.request_type ===
    "Owner Complaint"

  ? `/employee/requests/owner-chat/${req.id}`

: req.request_type ===
    "Complaint"

  ? `/employee/requests/complaints/${req.id}`

: req.request_type ===
    "Incident"

  ? `/employee/requests/incidents/${req.id}`

  : `/employee/requests/loa-roa/${req.id}`
}

    key={req.id}

    className="
      block
    "
  >

<div

  className={`

    bg-white

    hover:bg-emerald-50
    hover:border-emerald-200
    hover:shadow

    transition-all
    cursor-pointer

    border
    border-emerald-100

    rounded-xl
    shadow-sm

    px-6
    py-3

    ${updatedRecently

      ? "animate-soft-pulse"

      : ""

    }

  `}
>

        {/* DESKTOP */}

        <div
          className="
            hidden
            md:grid

           grid-cols-[220px_120px_150px_120px_150px_180px]

            gap-4
           items-center
          "
        >

          {/* TYPE */}

          <div>

            <div
              className="
              text-sm
font-semibold
text-emerald-700
              "
            >
              {req.is_owner_chat

  ? "🐼 Owner Request"

  : req.request_type

}
            </div>

          </div>

          {/* STATUS */}

          <div>

<StatusBadge
  status={req.status}
/>

          </div>

          {/* DETAILS */}

          <div>

            <div
className="
  text-sm
  font-semibold
  text-emerald-700
"
            >
              {req.subject ||
                req.title ||
                "No Subject"}
            </div>

          </div>

          {/* PRIORITY */}

          <div>

            <div
className="
  text-sm
  text-emerald-700
  font-medium
"
            >

              {req.priority ||
                req.severity ||
                "--"}

            </div>

          </div>

          {/* CLAIMED BY */}

<div>

  <div
className="
  text-sm
  text-emerald-700
"
  >

{req.claimed_by_name ||

  req.completed_by_name ||

  req.approved_by_name ||

  req.denied_by_name ||

  "--"}

  </div>

</div>

          {/* DATE */}

          <div>

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

        </div>

        {/* MOBILE */}

        <div
          className="
            md:hidden
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-3
            "
          >

            <div>

              <div
                className="
                  font-semibold
                  text-emerald-700
                "
              >
                {req.is_owner_chat

  ? "🐼 Owner Complaint"

  : req.request_type

}
              </div>

              <div
                className="
                  text-xs
                  text-emerald-500
                "
              >
                {new Date(
                  req.created_at
                ).toLocaleString()}
              </div>

            </div>

<StatusBadge
  status={req.status}
/>

          </div>

          <div
            className="
              text-sm
              text-emerald-700
            "
          >
            {req.subject}
          </div>

        </div>

        {/* ATTACHMENTS */}

        {(req.photo_url ||
          req.video_url ||
          req.document_url) && (

          <div
            className="
              mt-4
              pt-4
              border-t
              border-emerald-100
            "
          >

            <div
              className="
                text-xs
                uppercase
                tracking-wide
                font-semibold
                text-emerald-500
                mb-2
              "
            >
              Attachments
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              {req.photo_url && (

                <a

                  href={
                    req.photo_url
                  }

                  target="_blank"

                  className="
                    text-sm
                    text-emerald-700
                    underline
                  "
                >
                  Photo
                </a>

              )}

              {req.video_url && (

                <a

                  href={
                    req.video_url
                  }

                  target="_blank"

                  className="
                    text-sm
                    text-emerald-700
                    underline
                  "
                >
                  Video
                </a>

              )}

              {req.document_url && (

                <a

                  href={
                    req.document_url
                  }

                  target="_blank"

                  className="
                    text-sm
                    text-emerald-700
                    underline
                  "
                >
                  Document
                </a>

              )}

            </div>

          </div>
          

        )}
        

      </div>

       </Link>
      
     );

})}

{filteredRequests.length > 0 &&

 totalPages > 1 && (

  <div
    className="
      flex
      justify-center
      items-center

      gap-2

      mt-6
    "
  >

    <button

      onClick={() =>
        setCurrentPage(
          currentPage - 1
        )
      }

      disabled={
        currentPage === 1
      }

      className="
        px-4
        py-2

        rounded-xl

        border
        border-emerald-100

        bg-white

        disabled:opacity-40
      "
    >

      Previous

    </button>

    {Array.from({

      length:
        totalPages

    }).map((_, index) => (

      <button

        key={index}

        onClick={() =>
          setCurrentPage(
            index + 1
          )
        }

        className={`

          w-10
          h-10

          rounded-xl

          ${

            currentPage ===
            index + 1

              ? `
                bg-emerald-600
                text-white
              `

              : `
                bg-white
                border
                border-emerald-100
              `

          }

        `}
      >

        {index + 1}

      </button>

    ))}

    <button

      onClick={() =>
        setCurrentPage(
          currentPage + 1
        )
      }

      disabled={
        currentPage ===
        totalPages
      }

      className="
        px-4
        py-2

        rounded-xl

        border
        border-emerald-100

        bg-white

        disabled:opacity-40
      "
    >

      Next

    </button>

  </div>

)}

  </div>

</div>

   
  );
}