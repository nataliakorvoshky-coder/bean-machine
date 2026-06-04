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

    /*
      UPDATE ADJUSTMENT
    */

    await supabase

      .from(
        "loa_adjustment_requests"
      )

      .update({

        status,

        reviewed_at:
          new Date()
            .toISOString(),
      })

      .eq(
        "id",
        adjustment.id
      );

    /*
      APPLY CHANGES
    */

    if (
      status ===
      "approved"
    ) {

      /*
        EXTENSION
      */

      if (
        adjustment.request_type ===
        "extension"
      ) {

        await supabase

          .from(
            "loa_requests"
          )

          .update({

            end_date:
              adjustment.requested_end_date,
          })

          .eq(
            "id",
            adjustment.loa_request_id
          );
      }

      /*
        EARLY RETURN
      */

      if (
        adjustment.request_type ===
        "early_return"
      ) {

        await supabase

          .from(
            "loa_requests"
          )

          .update({

            end_date:
              adjustment.requested_end_date,
          })

          .eq(
            "id",
            adjustment.loa_request_id
          );
      }

      /*
        START DATE CHANGE
      */

      if (
        adjustment.request_type ===
        "start_date_change"
      ) {

        await supabase

          .from(
            "loa_requests"
          )

          .update({

            start_date:
              adjustment.requested_start_date,
          })

          .eq(
            "id",
            adjustment.loa_request_id
          );
      }
    }

    /*
      AUDIT EVENT
    */

    await supabase

      .from(
        "request_events"
      )

      .insert({

        request_table:
          "loa_requests",

        request_id:
          adjustment.loa_request_id,

        related_id:
          adjustment.id,

        event_type:

status === "approved"

? "loa_adjustment_approved"

: "loa_adjustment_denied",

        metadata: {

          request_type:
            adjustment.request_type,
        },

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      SYSTEM CHAT MESSAGE
    */

    await supabase

      .from(
        "request_comments"
      )

      .insert({

        request_id:
          adjustment.loa_request_id,

        request_type:
          "loa",

        sender_role:
          "manager",

        sender_name:
          "System",

        message_type:
          "workflow",

        message:

status === "approved"

? `Approved adjustment request.`

: `Denied adjustment request.`,

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      UPDATE ACTIVITY
    */

    await supabase

      .from(
        "loa_requests"
      )

      .update({

        last_activity_at:
          new Date()
            .toISOString(),
      })

      .eq(
        "id",
        adjustment.loa_request_id
      );

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