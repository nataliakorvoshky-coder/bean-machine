"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

type Props = {

  complaintId?: string;

  incidentId?: string;

  canManageMembers?: boolean;

};

export default function OwnerChatSidebar({

  complaintId,

  incidentId,

  canManageMembers = true,

}: Props) {

  const ticketId =

    complaintId ||

    incidentId;

const [
  admins,
  setAdmins
] = useState<any[]>([]);

const [
  members,
  setMembers
] = useState<any[]>([]);

const [
  employees,
  setEmployees
] = useState<any[]>([]);

const [
  showAddModal,
  setShowAddModal
] = useState(false);

useEffect(() => {

  console.log(
    "OWNER CHAT SIDEBAR LOADED"
  );

console.log(
  "TICKET ID:",
  ticketId
);

  loadMembers();

  loadEmployees();

}, [ticketId]);

async function loadMembers() {

  const {
    data: auth
  } = await supabase.auth.getUser();

  if (!auth.user)
    return;

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    *,
    employees(*)
  `)

  .eq(
    "id",
    auth.user.id
  )

  .single();

let roleName = null;

if (profile?.role_id) {

  const {
    data: role
  } = await supabase

    .from("roles")

    .select(`
      name
    `)

    .eq(
      "id",
      profile.role_id
    )

    .single();

  roleName =
    role?.name;
}

console.log(
  "ROLE NAME:",
  roleName
);

if (
  roleName ===
  "admin"
) {

const {
  data: adminInsert,
  error: adminError
} = await supabase

  .from(
    "owner_chat_members"
  )

  .upsert(

    {

complaint_id:
  ticketId,

      employee_id:
        profile.employee_id,

      employee_name:
        profile.employees?.name,

      is_admin:
        true,

    },

    {

      onConflict:
        "complaint_id,employee_id"

    }

  )

  .select();

console.log(
  "ADMIN INSERT:",
  adminInsert
);

console.log(
  "ADMIN ERROR:",
  adminError
);

}

  const {
    data,
    error
  } = await supabase

    .from(
      "owner_chat_members"
    )

    .select("*")

.eq(
  "complaint_id",
  ticketId
);

    console.log(
  "OWNER CHAT MEMBERS:",
  data
);

  if (!data)
    return;

  setAdmins(
    data.filter(
      x => x.is_admin
    )
  );

  setMembers(
    data.filter(
      x => !x.is_admin
    )
  );

}

async function loadEmployees() {

  const {
    data
  } = await supabase

    .from("employees")

    .select(`
      id,
      name
    `)

    .order(
      "name"
    );

setEmployees(

  (data || []).filter(
    employee =>

      employee.name !==
      null
  )

);

}

async function addParticipant(
  employee: any
) {

  const response =
    await fetch(

      "/api/owner-chat/members/add",

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

body: JSON.stringify({

  complaint_id:
    ticketId,

  employee_id:
    employee.id,

}),

      }

    );

  const result =
    await response.json();

  if (!response.ok) {

    alert(
      result.error ||
      "Failed to add participant"
    );

    return;
  }

  setShowAddModal(false);

  loadMembers();

}

async function removeParticipant(
  memberId: string
) {

  const response =
    await fetch(

      "/api/owner-chat/members/remove",

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          member_id:
            memberId,

        }),

      }

    );

  const result =
    await response.json();

  if (!response.ok) {

    alert(
      result.error ||
      "Failed to remove participant"
    );

    return;
  }

  loadMembers();

}

  return (

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
          text-xl
          font-bold
          text-emerald-700
          mb-6
        "
      >
        Owner Chat Members
      </div>

{canManageMembers && (

  <button

    onClick={() =>
      setShowAddModal(true)
    }

    className="
      w-full
      py-3
      rounded-xl
      bg-emerald-600
      text-white
      mb-6
    "
  >

    Add Participant

  </button>

)}

      {/* ADMINS */}

      <div className="mb-6">

        <div
          className="
            text-sm
            font-semibold
            text-emerald-700
            mb-3
          "
        >
          Admins
        </div>

        <div className="space-y-2">

          {admins.map(
            (admin) => (

<div

  key={admin.id}

  className="
    bg-purple-50

    border
    border-purple-200

    rounded-xl

    p-3

    font-semibold

    text-purple-700
  "
>

  🐼 {admin.employee_name}

</div>

            )
          )}

        </div>

      </div>

      {/* PARTICIPANTS */}

      <div>

        <div
          className="
            text-sm
            font-semibold
            text-emerald-700
            mb-3
          "
        >
          Participants
        </div>

        <div className="space-y-2">

          {members.length === 0 ? (

            <div
              className="
                text-sm
                text-emerald-500
              "
            >
              No participants added
            </div>

          ) : (

            members.map(
              (member) => (

                <div

                  key={member.id}

                  className="
                    flex
                    items-center
                    justify-between

                    bg-blue-50

                    border
                    border-blue-100

                    rounded-xl

                    p-3
                  "
                >

<span
  className={

    member.is_manager

      ? "text-[#D4AF37] font-semibold"

      : member.is_supervisor

      ? "text-[#B57EDC] font-semibold"

      : ""

  }
>
  {

    member.is_manager

      ? `⭐ ${member.employee_name}`

      : member.is_supervisor

      ? `💠 ${member.employee_name}`

      : member.employee_name

  }
</span>

{canManageMembers && !member.is_admin && (

  <button

    onClick={() =>
      removeParticipant(
        member.id
      )
    }

    className="
      px-3
      py-1

      rounded-lg

      bg-red-50
      hover:bg-red-100

      text-red-600

      text-xs
      font-medium
    "
  >

    Remove

  </button>

)}

                </div>

              )
            )

          )}

        </div>

      </div>

      {canManageMembers && showAddModal && (

  <div
    className="
      fixed
      inset-0

      bg-black/40

      flex
      items-center
      justify-center

      z-[999999]
    "
  >

    <div
      className="
        bg-white

        rounded-2xl

        shadow-2xl

        p-6

        w-[500px]
      "
    >

      <div
        className="
          text-xl
          font-bold

          text-emerald-700

          mb-4
        "
      >
        Add Participant
      </div>

      <div
        className="
          max-h-[400px]
          overflow-y-auto

          space-y-2
        "
      >

{employees

  .filter(

    employee =>

      !admins.some(
        admin =>

          admin.employee_id ===
          employee.id
      )

      &&

      !members.some(
        member =>

          member.employee_id ===
          employee.id
      )

  )

  .map(
    (employee) => (

            <button

              key={employee.id}

              onClick={() =>
                addParticipant(
                  employee
                )
              }

              className="
                w-full

                text-left

                p-3

                rounded-xl

                border
                border-emerald-100

                hover:bg-emerald-50
              "
            >

              {employee.name}

            </button>

          )
        )}

      </div>

      <button

        onClick={() =>
          setShowAddModal(false)
        }

        className="
          mt-4

          w-full

          py-3

          rounded-xl

          bg-gray-100
        "
      >

        Close

      </button>

    </div>

  </div>

)}

    </div>

  );

}