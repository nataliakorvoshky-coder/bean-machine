import { NextResponse } from "next/server";

import { createClient }
  from "@supabase/supabase-js";

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
      managerName,
    } = body;

    /*
      VALIDATION
    */

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
      UPDATE TICKET
    */

    const {
      error:
        updateError,
    } = await supabase

      .from(
        "hours_exception_requests"
      )

      .update({

        status:
          "Completed",

        completed_by_id:
          managerId,

        completed_by_name:
          managerName,

        completed_at:
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

    /*
      UPDATE ERROR
    */

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
      GET EMPLOYEE
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
      GET TICKET
    */

    const {
      data: ticket,
    } = await supabase

      .from(
        "hours_exception_requests"
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
      ACTIVITY LOG
    */

    await supabase

      .from("activity_logs")

      .insert({

        action:
          `Completed "${ticket?.subject}" for ${ticket?.employee_name}`,

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

    /*
      RESPONSE
    */

    return NextResponse.json({

      success: true,
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