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

    /*
      VALIDATION
    */

    if (

      !body.employee_id ||

      !body.employee_name ||

      !body.request_type ||

      !body.leave_reason ||

      !body.subject ||

      !body.description

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
        "loa_requests"
      )

      .insert({

        employee_id:
          body.employee_id,

        employee_name:
          body.employee_name,

        request_type:
          body.request_type,

        leave_reason:
          body.leave_reason,

        start_date:
          body.start_date || null,

        end_date:
          body.end_date || null,

        subject:
          body.subject,

        description:
          body.description,

        photo_url:
          body.photo_url || null,

        document_url:
          body.document_url || null,

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

        completed_at:
          null,

        /*
          ACTIVITY
        */

        last_activity_at:
          new Date()
            .toISOString(),

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
          `Submitted ${body.request_type} request: ${body.subject}`,

        type:
          "LOA Request",

        username:
          body.employee_name,

        employee_name:
          body.employee_name,

        created_at:
          new Date()
            .toISOString(),
      });

    /*
      SUCCESS
    */

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