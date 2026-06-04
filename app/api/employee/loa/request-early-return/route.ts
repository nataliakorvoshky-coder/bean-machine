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

      requestedReturnDate,

      employeeId,

      employeeName,

    } = body;

    /*
      VALIDATION
    */

    if (

      !ticketId ||

      !requestedReturnDate ||

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
          "early_return",

        requested_end_date:
          requestedReturnDate,

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

    /*
      INSERT ERROR
    */

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

        message: `Requested early return.

Requested Return Date:
${requestedReturnDate}

Awaiting manager approval.`,

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      EVENT LOG
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
            "early_return",
        },

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
        ticketId
      );

    /*
      SUCCESS
    */

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