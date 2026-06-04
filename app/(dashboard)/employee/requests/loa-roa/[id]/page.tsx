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

  import StyledDropdown
  from "@/components/StyledDropdown";

import StyledDatePicker
  from "@/components/StyledDatePicker";

export default function LOATicketPage() {

  const params =
    useParams();

  const ticketId =
    params.id as string;

    const [ticket, setTicket] =
  useState<any>(null);

  const [
  requestAction,
  setRequestAction
] = useState("");

const [
  requestedDate,
  setRequestedDate
] = useState("");

const [
  submittingRequest,
  setSubmittingRequest
] = useState(false);

useEffect(()=>{

  if (!ticketId)
    return;

  loadTicket();

}, [ticketId]);

async function loadTicket() {

  const {
    data,
  } = await supabase

    .from(
      "loa_requests"
    )

    .select("*")

    .eq(
      "id",
      ticketId
    )

    .maybeSingle();

  setTicket(data);
}

if (!ticket) {

  return null;
}


async function submitAdjustmentRequest() {

  if (
    !requestAction ||
    !requestedDate
  ) {
    return;
  }

  try {

    setSubmittingRequest(true);

    let endpoint = "";

    let payload: any = {

      ticketId:
        ticket.id,

      employeeId:
        ticket.employee_id,

      employeeName:
        ticket.employee_name,
    };

    /*
      EXTENSION
    */

    if (
      requestAction ===
      "extension"
    ) {

      endpoint =
        "/api/employee/loa/request-extension";

      payload.requestedEndDate =
        requestedDate;
    }

    /*
      EARLY RETURN
    */

    if (
      requestAction ===
      "early_return"
    ) {

      endpoint =
        "/api/employee/loa/request-early-return";

      payload.requestedReturnDate =
        requestedDate;
    }

    /*
      START DATE CHANGE
    */

    if (
      requestAction ===
      "new_start_date"
    ) {

      endpoint =
        "/api/employee/loa/request-start-date-change";

      payload.requestedStartDate =
        requestedDate;
    }

    /*
      API CALL
    */

    const res =
      await fetch(

        endpoint,

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.error(data);

      return;
    }

    /*
      RESET
    */

    setRequestAction("");
    setRequestedDate("");

    /*
      REFRESH
    */

    loadTicket();

  } catch (err) {

    console.error(err);

  } finally {

    setSubmittingRequest(false);
  }
}

const requestOptions = [

  {
    id: "extension",
    name: "Request Extension",
  },

  {
    id: "early_return",
    name: "Request Early Return",
  },

  {
    id: "new_start_date",
    name: "Request New Start Date",
  },
];

return (

<div
className="
  pt-2
  px-6
  pb-6

  grid

  grid-cols-[minmax(0,1fr)_380px]

  gap-6

  w-full
"
>

    {/* LEFT SIDE */}

    <div
  className="
    w-full
    min-w-0

    flex
    flex-col
  "
>

      <TicketChat

        ticketId={ticket.id}

requestType="loa"

senderRole="employee"

        senderName={
          ticket.employee_name
        }

tableName="loa_requests"
      />

    </div>

{/* RIGHT SIDE */}

<div
  className="
    sticky
    top-6

    self-start
  "
>

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
            label="Priority"
            value={
              ticket.priority
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

        </div>

        {/* LOA REQUEST ACTIONS */}

<div className="mt-6">

  <div
    className="
      text-sm
      font-semibold
      text-emerald-700
      mb-3
    "
  >
    Request Changes
  </div>

  <div
    className="
      bg-emerald-50

      border
      border-emerald-100

      rounded-2xl

      p-5
    "
  >

    {/* DROPDOWN */}

    <StyledDropdown

      placeholder="
        Select Request Type
      "

      options={requestOptions}

      value={requestAction}

      onChange={setRequestAction}

      width="100%"
    />

    {/* EXTENSION */}

    {requestAction ===
      "extension" && (

      <div className="mt-4">

        <div
          className="
            text-xs
            font-semibold
            text-emerald-700
            mb-2
          "
        >
          Requested New End Date
        </div>

        <StyledDatePicker

          value={requestedDate}

          onChange={
            setRequestedDate
          }
        />

      </div>
    )}

    {/* EARLY RETURN */}

    {requestAction ===
      "early_return" && (

      <div className="mt-4">

        <div
          className="
            text-xs
            font-semibold
            text-emerald-700
            mb-2
          "
        >
          Requested Early Return Date
        </div>

        <StyledDatePicker

          value={requestedDate}

          onChange={
            setRequestedDate
          }
        />

      </div>
    )}

    {/* NEW START DATE */}

    {requestAction ===
      "new_start_date" && (

      <div className="mt-4">

        <div
          className="
            text-xs
            font-semibold
            text-emerald-700
            mb-2
          "
        >
          Requested New Start Date
        </div>

        <StyledDatePicker

          value={requestedDate}

          onChange={
            setRequestedDate
          }
        />

      </div>
    )}

    {/* SUBMIT */}

    {requestAction && (
      <button

        onClick={
          submitAdjustmentRequest
        }

        disabled={
          submittingRequest
        }

        className="
          mt-5

          w-full

          bg-emerald-600
          hover:bg-emerald-700

          disabled:opacity-50

          text-white
          font-semibold

          rounded-xl

          py-3

          transition
        "
      >

        {submittingRequest

          ? "Submitting..."

          : "Submit Request"}

      </button>
    )}

  </div>

</div>

      </div>

    </div>

  </div>

);

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
}