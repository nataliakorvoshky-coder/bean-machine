import { NextResponse } from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    /*
      VALIDATION
    */

    if (
      !body.employee_id ||
      !body.employee_name ||
      !body.subject ||
      !body.exception_type ||
      !body.reason
    ) {

      return NextResponse.json(

        {
          error:
            "Missing required fields",
        },

        {
          status: 400,
        }
      );
    }

    /*
      CREATE REQUEST
    */

    const {
      data,
      error,
    } = await supabase

      .from(
        "hours_exception_requests"
      )

      .insert({

        employee_id:
          body.employee_id,

        employee_name:
          body.employee_name,

        subject:
          body.subject,

        exception_type:
          body.exception_type,

        requested_hours:
          body.requested_hours || 0,

        week_of:
          body.week_of || null,

        reason:
          body.reason,

        attachments:
          body.attachments || [],

        /*
          WORKFLOW
        */

        status:
          "Pending",

        priority:
          "Normal",

        escalation_level:
          0,

        escalated:
          false,

        claimed_by:
          null,

        claimed_by_id:
          null,

        approved_by:
          null,

        approved_at:
          null,

        denied_by:
          null,

        denied_at:
          null,

        /*
          TIMESTAMPS
        */

        created_at:
          new Date()
            .toISOString(),

        /*
          HISTORY
        */

        notes_history: [

          {

            text:
              "Request submitted",

            by:
              body.employee_name,

            at:
              new Date()
                .toISOString(),

            type:
              "Created",
          },

        ],
      })

      .select()

      .single();

    /*
      INSERT ERROR
    */

    if (error) {

      return NextResponse.json(

        {
          error:
            error.message,
        },

        {
          status: 500,
        }
      );
    }

    /*
      ACTIVITY LOG
    */

    await supabase

      .from(
        "activity_logs"
      )

      .insert({

        action:
          `Submitted "${body.subject}"`,

        type:
          "Hours Exception",

        username:
          body.employee_name,

        employee_name:
          body.employee_name,

        created_at:
          new Date()
            .toISOString(),
      });

    return NextResponse.json({

      success: true,

      request:
        data,
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