import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {

      ticketId,

      requestedEndDate,

      employeeId,

      employeeName,

    } = body;

    /*
      VALIDATION
    */

    if (

      !ticketId ||

      !requestedEndDate ||

      !employeeId

    ) {

      return NextResponse.json(

        {
          error:
            "Missing fields",
        },

        {
          status: 400,
        }
      );
    }

    /*
      CREATE ADJUSTMENT REQUEST
    */

    const {

      data: adjustment,

      error: adjustmentError,

    } = await supabase

      .from(
        "loa_adjustment_requests"
      )

      .insert({

        loa_request_id:
          ticketId,

        request_type:
          "extension",

        requested_end_date:
          requestedEndDate,

        status:
          "pending",

        requested_by:
          employeeId,

        requested_by_name:
          employeeName,

        created_at:
          new Date()
            .toISOString(),
      })

      .select()

      .single();

    if (adjustmentError) {

      return NextResponse.json(

        {
          error:
            adjustmentError.message,
        },

        {
          status: 500,
        }
      );
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
          ticketId,

        related_id:
          adjustment.id,

        event_type:
          "loa_adjustment_created",

        actor_id:
          employeeId,

        actor_name:
          employeeName,

        metadata: {

          type:
            "extension",
        },

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      WORKFLOW MESSAGE
    */

    await supabase

      .from(
        "request_comments"
      )

      .insert({

        request_id:
          ticketId,

        request_type:
          "loa",

        sender_id:
          employeeId,

        sender_name:
          employeeName,

        sender_role:
          "employee",

        message_type:
          "workflow",

        message: `Requested LOA extension.

Requested New End Date:
${requestedEndDate}

Awaiting manager approval.`,

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      UPDATE TICKET
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
        ticketId
      );

    return NextResponse.json({

      success: true,

      adjustment,
    });

  } catch (err: any) {

    return NextResponse.json(

      {
        error:
          err.message,
      },

      {
        status: 500,
      }
    );
  }
}