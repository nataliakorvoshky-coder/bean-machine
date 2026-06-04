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

export default function HoursExceptionTicketPage() {

  const params =
    useParams();

  const ticketId =
    params.id as string;

    const [ticket, setTicket] =
  useState<any>(null);

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
      "hours_exception_requests"
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

requestType="hours_exception"

senderRole="employee"

        senderName={
          ticket.employee_name
        }

tableName="hours_exception_requests"
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
              Hours Exception Ticket
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
            {ticket.reason}
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