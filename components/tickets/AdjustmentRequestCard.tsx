"use client";

import {
  supabase
} from "@/lib/supabase";

type Props = {

  adjustment: any;

  onUpdated: ()=>void;
};

export default function
AdjustmentRequestCard({

  adjustment,

  onUpdated,

}: Props) {

  const pending =
    adjustment.status ===
    "pending";

  async function approve() {

    await updateStatus(
      "approved"
    );
  }

  async function deny() {

    await updateStatus(
      "denied"
    );
  }

async function updateStatus(
  status: string
) {

  const routeMap: Record<string, string> = {

    extension:
      "extension",

    early_return:
      "early-return",

    start_date_change:
      "start-date-change",
  };

  const route =
    routeMap[
      adjustment.request_type
    ];

  const endpoint =

    status === "approved"

      ? `/api/manager/loa/approve-${route}`

      : `/api/manager/loa/deny-${route}`;

  console.log(
    "CALLING:",
    endpoint
  );

  const res = await fetch(
    endpoint,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        adjustmentId:
          adjustment.id,

        loaRequestId:
          adjustment.loa_request_id,
      }),
    }
  );

  if (!res.ok) {

    const text =
      await res.text();

    console.error(
      "API ERROR:",
      text
    );

    return;
  }

  onUpdated();
}

  return (

    <div
      className="
        bg-amber-50

        border
        border-amber-200

        rounded-2xl

        p-4

        mb-4
      "
    >

      <div
        className="
          text-sm
          font-semibold
          text-amber-800

          mb-2
        "
      >
        LOA Adjustment Request
      </div>

      <div
        className="
          text-sm
          text-amber-700

          whitespace-pre-wrap
        "
      >

        {adjustment.request_type ===
          "extension" && (
          <>
            Requested Extension
            <br />
            New End Date:
            {" "}
            {
              adjustment.requested_end_date
            }
          </>
        )}

        {adjustment.request_type ===
          "early_return" && (
          <>
            Requested Early Return
            <br />
            Return Date:
            {" "}
            {
              adjustment.requested_end_date
            }
          </>
        )}

        {adjustment.request_type ===
          "start_date_change" && (
          <>
            Requested Start Date Change
            <br />
            New Start Date:
            {" "}
            {
              adjustment.requested_start_date
            }
          </>
        )}

      </div>

      {/* STATUS */}

      <div
        className="
          mt-3

          text-xs
          uppercase
          tracking-wide

          font-semibold

          text-amber-700
        "
      >

        Status:
        {" "}
        {adjustment.status}

      </div>

      {/* ACTIONS */}

      {pending && (

        <div
          className="
            flex
            gap-2

            mt-4
          "
        >

          <button

            onClick={approve}

            className="
              px-4
              py-2

              rounded-xl

              bg-emerald-600
              hover:bg-emerald-700

              text-white
              text-sm
            "
          >
            Approve
          </button>

          <button

            onClick={deny}

            className="
              px-4
              py-2

              rounded-xl

              bg-red-600
              hover:bg-red-700

              text-white
              text-sm
            "
          >
            Deny
          </button>

        </div>
      )}

    </div>
  );
}