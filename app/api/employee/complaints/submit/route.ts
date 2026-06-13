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

      !body.complaint_type ||

      !body.complaint_against ||

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
      CREATE TICKET
    */

    const {

      data,

      error,

    } = await supabase

      .from(
        "complaint_requests"
      )

      .insert({

        employee_id:
          body.employee_id,

        employee_name:
          body.employee_name,

        complaint_type:
          body.complaint_type,

        complaint_against:
          body.complaint_against,

        subject:
          body.subject,

        description:
          body.description,

        involved_people:
          body.involved_people,

        incident_date:
          body.incident_date,

        requested_resolution:
          body.requested_resolution,

        photo_url:
          body.photo_url || null,

        video_url:
          body.video_url || null,

        anonymous:
          body.anonymous,

        /*
          WORKFLOW
        */

        status:
          "Pending",

        escalation_level:
          0,

        escalated_by:
          null,

          escalated_to:
          null,

        claimed_by:
          null,

        claimed_by_id:
          null,

        resolved_at:
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
              "Complaint submitted",

            by:
              body.anonymous

                ? "Anonymous"

                : body.employee_name,

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
          `Submitted complaint: ${body.subject}`,

        type:
          "Complaint Request",

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