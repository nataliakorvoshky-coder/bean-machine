import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SECRET_KEY!
  );

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      ticketId,
      managerId,
    } = body;

    if (
      !ticketId ||
      !managerId
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
      GET MANAGER PROFILE
    */

    const {
      data: managerProfile,
    } = await supabase

      .from("profiles")

      .select(`
        username,
        employee_id
      `)

      .eq(
        "id",
        managerId
      )

      .maybeSingle();

    /*
      GET MANAGER EMPLOYEE
    */

    const {
      data: managerEmployee,
    } = await supabase

      .from("employees")

      .select(`
        name
      `)

      .eq(
        "id",
        managerProfile?.employee_id
      )

      .maybeSingle();

      /*
  GET CURRENT TICKET
*/

const {
  data: currentTicket,
} = await supabase

  .from(
    "loa_requests"
  )

  .select(`
    escalation_level
  `)

  .eq(
    "id",
    ticketId
  )

  .maybeSingle();

const currentLevel =
  currentTicket?.escalation_level || 0;

/*
  MAX ESCALATION CHECK
*/

if (currentLevel >= 2) {

  return NextResponse.json(

    {
      error:
        "Maximum escalation reached",
    },

    {
      status: 400,
    }
  );
}

const nextLevel =
  currentLevel + 1;

    /*
      UPDATE TICKET
    */

    const {
      error:
        updateError,
    } = await supabase

      .from(
        "loa_requests"
      )

.update({

  escalated: true,

  escalation_level:
    nextLevel,

  escalated_by:
    managerEmployee?.name,

  escalated_by_id:
    managerId,

  escalated_at:
    new Date()
      .toISOString(),

        last_activity_at:
    new Date()
      .toISOString(),
      
})

      .eq(
        "id",
        ticketId
      );

    if (updateError) {

      return NextResponse.json(

        {
          error:
            updateError.message,
        },

        {
          status: 500,
        }
      );
    }

    /*
      GET TICKET
    */

    const {
      data: ticket,
    } = await supabase

      .from(
        "loa_requests"
      )

      .select(`
        employee_name,
        subject
      `)

      .eq(
        "id",
        ticketId
      )

      .maybeSingle();

    /*
      ACTIVITY FEED LOG
    */

    await supabase

      .from("activity_logs")

      .insert({

action:
  `Escalated "${ticket?.subject}" to level ${nextLevel} for ${ticket?.employee_name}`,

        type:
          "Hours Exception",

        username:
          managerProfile?.username,

        employee_name:
          managerEmployee?.name,

        created_at:
          new Date()
            .toISOString(),
      });

return NextResponse.json({

  success: true,

  escalation_level:
    nextLevel,
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