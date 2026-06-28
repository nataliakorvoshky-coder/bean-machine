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

      !body.incident_type ||

      !body.severity ||

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
      CREATE INCIDENT
    */

    const {

      data,

      error,

    } = await supabase

      .from(
        "incident_requests"
      )

      .insert({

        employee_id:
          body.employee_id,

        employee_name:
          body.employee_name,

        incident_type:
          body.incident_type,

        severity:
          body.severity,

        subject:
          body.subject,

        description:
          body.description,

        people_involved:
          body.people_involved,

        incident_date:
          body.incident_date,

        location:
          body.location,

        injuries_reported:
          body.injuries_reported,

        immediate_action_taken:
          body.immediate_action_taken,

        photo_url:
          body.photo_url || null,

        video_url:
          body.video_url || null,

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
              "Incident submitted",

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
          `Submitted incident: ${body.subject}`,

        type:
          "Incident Report",

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