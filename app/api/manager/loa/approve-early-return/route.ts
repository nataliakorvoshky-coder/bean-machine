import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request
) {
  try {

    const {
      adjustmentId
    } = await req.json();

    const {
      data: adjustment,
      error
    } = await supabase

      .from("loa_adjustment_requests")

      .select("*")

      .eq("id", adjustmentId)

      .single();

    if (
      error ||
      !adjustment
    ) {
      return NextResponse.json(
        {
          error: "Adjustment not found"
        },
        {
          status: 404
        }
      );
    }

    /*
      APPROVE
    */

    await supabase

      .from("loa_adjustment_requests")

      .update({

        status: "approved",

        reviewed_at:
          new Date().toISOString(),

      })

      .eq(
        "id",
        adjustment.id
      );

    /*
      AUDIT EVENT
    */

    await supabase

      .from("request_events")

      .insert({

        request_table:
          "loa_requests",

        request_id:
          adjustment.loa_request_id,

        related_id:
          adjustment.id,

        event_type:
          "loa_early_return_approved",

        metadata: {

          requested_return_date:
            adjustment.requested_end_date,

        },

        created_at:
          new Date().toISOString(),

      });

    /*
      UPDATE LOA
    */

    await supabase

      .from("loa_requests")

      .update({

        end_date:
          adjustment.requested_end_date,

        last_activity_at:
          new Date().toISOString(),

      })

      .eq(
        "id",
        adjustment.loa_request_id
      );

    /*
      CHAT MESSAGE
    */

    await supabase

      .from("request_comments")

      .insert({

        request_id:
          adjustment.loa_request_id,

        request_type:
          "loa",

        sender_role:
          "system",

        sender_name:
          "System",

        message_type:
          "workflow",

        message:

`Early Return Approved

New Return Date:
${adjustment.requested_end_date}`,

        created_at:
          new Date().toISOString(),

      });

    return NextResponse.json({
      success: true
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message
      },
      {
        status: 500
      }
    );
  }
}