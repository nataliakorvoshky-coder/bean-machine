"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

import StyledDropdown
  from "@/components/StyledDropdown";

interface Props {

  requestTable: string;

  requestId: string;

  currentStatus: string;

  onSuccess?: ()=>void;
}

const STATUS_OPTIONS = [

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

  {
    id: "Reopened",
    name: "Reopened",
  },
];

export default function AdminOverridePanel({

  requestTable,

  requestId,

  currentStatus,

  onSuccess,

}: Props) {

  const [

    status,
    setStatus,

  ] = useState(
    currentStatus
  );

  const [

    reason,
    setReason,

  ] = useState("");

  const [

    loading,
    setLoading,

  ] = useState(false);

  const [
  isAdmin,
  setIsAdmin
] = useState(false);

useEffect(()=>{

  checkAdmin();

}, []);

async function checkAdmin() {

  const {
    data: auth
  } = await supabase
    .auth
    .getUser();

  const user =
    auth?.user;

  if (!user)
    return;

  /*
  PROFILE
*/

const {
  data: profile
} = await supabase

  .from("profiles")

  .select(`
    role_id
  `)

  .eq(
    "id",
    user.id
  )

  .maybeSingle();

if (!profile?.role_id)
  return;

/*
  ROLE
*/

const {
  data: role
} = await supabase

  .from("roles")

  .select(`
    name,
    level
  `)

  .eq(
    "id",
    profile.role_id
  )

  .maybeSingle();

/*
  ADMIN CHECK
*/

if (

  role?.name === "admin"

  ||

  role?.level >= 4

) {

  setIsAdmin(true);
}
}

  async function submitOverride() {

    try {

      setLoading(true);

      /*
        GET USER
      */

      const {
        data: auth,
      } = await supabase
        .auth
        .getUser();

      const user =
        auth?.user;

      if (!user)
        return;

      /*
        GET PROFILE
      */

      const {
        data: profile
      } = await supabase

        .from("profiles")

        .select(`
          username,
          employee_id
        `)

        .eq(
          "id",
          user.id
        )

        .maybeSingle();

      /*
        GET EMPLOYEE
      */

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

      /*
        API CALL
      */

      const res =
        await fetch(

          "/api/admin/override-request",

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              requestTable,

              requestId,

              newStatus:
                status,

              reason,

              adminId:
                user.id,

              adminName:

                employee?.name ||

                profile?.username ||

                "Admin",
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
        REFRESH
      */

      onSuccess?.();

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  if (!isAdmin)
  return null;

  return (

    <div className="mt-8">

      <div
        className="
          text-[11px]
          uppercase
          tracking-[0.15em]

          text-red-500

          font-semibold

          mb-4
        "
      >
        Admin Override
      </div>

      <div
        className="
          border
          border-red-100

          bg-red-50/70

          rounded-2xl

          p-4
        "
      >

        {/* STATUS */}

        <div className="mb-4">

          <div
            className="
              text-xs
              font-semibold
              text-red-700
              mb-2
            "
          >
            Override Status
          </div>

<StyledDropdown

  placeholder="
    Select Status
  "

  options={
    STATUS_OPTIONS
  }

  value={status}

  onChange={setStatus}

  width="100%"

  className="w-full"
/>

        </div>

        {/* REASON */}

        <div className="mb-4">

          <div
            className="
              text-xs
              font-semibold
              text-red-700
              mb-2
            "
          >
            Override Reason
          </div>

          <textarea

            value={reason}

            onChange={(e)=>
              setReason(
                e.target.value
              )
            }

            placeholder="
              Explain why this override is necessary...
            "

            className="
              w-full
              h-28

              rounded-xl

              border
              border-red-200

              bg-white

              px-4
              py-3

              text-sm
              text-red-700

              resize-none

              outline-none

              focus:ring-2
              focus:ring-red-200
            "
          />

        </div>

        {/* BUTTON */}

        <button

          onClick={submitOverride}

          disabled={loading}

          className="
            w-full
            h-11

            rounded-xl

            bg-red-600
            hover:bg-red-700

            text-sm
            font-semibold
            text-white

            transition-all

            disabled:opacity-50
          "
        >

          {loading

            ? "Overriding..."

            : "Confirm Override"}

        </button>

        {/* WARNING */}

        <div
          className="
            mt-4

            text-xs
            text-red-500

            leading-relaxed
          "
        >
          Admin overrides bypass
          normal workflow rules and
          are permanently logged in
          request history.
        </div>

      </div>

    </div>
  );
}