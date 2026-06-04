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

  return () => {

    supabase.removeChannel(
      hoursChannel
    );

    supabase.removeChannel(
      loaChannel
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

    const requestTable =

      req.request_type ===
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

const filteredRequests = requests.filter((req) => {

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

<div className="
  flex flex-wrap gap-4
  items-end
  mb-8
">

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

{/* MY REQUESTS */}

<div>

  <h2
    className="
      text-2xl
      font-bold
      text-emerald-700
      mb-4
    "
  >
    My Requests
  </h2>

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

    )}

{filteredRequests.map((req) => {

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
              {req.request_type}
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
                {req.request_type}
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


  </div>

</div>

    </div>
  );
}