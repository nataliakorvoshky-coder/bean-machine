"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase";

import StatusBadge
  from "@/components/shared/StatusBadge";

import OwnerChat
  from "@/components/tickets/OwnerChat";

import OwnerChatSidebar
  from "@/components/tickets/OwnerChatSidebar";

export default function EmployeeOwnerChatPage() {

  const params =
    useParams();

  const ticketId =
    params.id as string;

  const [
    ticket,
    setTicket
  ] = useState<any>(null);


useEffect(() => {

  if (!ticketId)
    return;

  loadTicket();

  markAsRead();

}, [ticketId]);

  async function loadTicket() {

    const {
      data
    } = await supabase

      .from(
        "complaint_requests"
      )

      .select("*")

      .eq(
        "id",
        ticketId
      )

      .maybeSingle();

    setTicket(data);

  }

async function markAsRead() {

  const {
    data: auth
  } = await supabase.auth.getUser();

  if (!auth.user)
    return;

  const {
    data: profile
  } = await supabase

    .from("profiles")

    .select("employee_id")

    .eq(
      "id",
      auth.user.id
    )

    .single();

  if (!profile?.employee_id)
    return;

await supabase

  .from(
    "owner_chat_reads"
  )

  .upsert(

    {

      complaint_id:
        ticketId,

      employee_id:
        profile.employee_id,

      last_read_at:
        new Date()
          .toISOString(),

    },

    {

      onConflict:
        "complaint_id,employee_id"

    }

  );

}

  if (!ticket) {

    return null;

  }

return (

  <div
    className="
      w-full
      max-w-none

      py-6
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

      <div
        className="
          w-full
          min-w-0
        "
      >

        <OwnerChat
          complaintId={ticket.id}
        />

      </div>

<OwnerChatSidebar
  complaintId={ticket.id}
  canManageMembers={false}
/>

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
        bg-purple-50

        border
        border-purple-100

        rounded-2xl

        p-4
      "
    >

      <div
        className="
          text-xs
          uppercase

          tracking-wide

          text-purple-500

          mb-1
        "
      >
        {label}
      </div>

      <div
        className="
          text-sm
          font-semibold

          text-purple-700
        "
      >
        {value || "--"}
      </div>

    </div>

  );

}