import { NextResponse }
  from "next/server";

import {
  createClient
} from "@supabase/supabase-js";

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

    /*
      BODY
    */

    const body =
      await req.json();

    const {

      requestTable,
      requestId,

      newStatus,

      reason,

      adminId,
      adminName,

    } = body;

    /*
      VALIDATION
    */

    if (

      !requestTable ||
      !requestId ||
      !newStatus ||
      !adminId

    ){

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
  VERIFY ADMIN
*/

const {
  data: profile,

  error: profileError,

} = await supabase

  .from("profiles")

  .select(`
    role
  `)

  .eq(
    "id",
    adminId
  )

  .maybeSingle();

/*
  PROFILE ERROR
*/

if (
  profileError
) {

  return NextResponse.json(

    {
      error:
        profileError.message,
    },

    {
      status: 500,
    }
  );
}

/*
  NOT ADMIN
*/

if (
  profile?.role !==
  "admin"
) {

  return NextResponse.json(

    {
      error:
        "Unauthorized",
    },

    {
      status: 403,
    }
  );
}


    /*
      GET REQUEST
    */

    const {

      data: request,

      error: requestError,

    } = await supabase

      .from(requestTable)

      .select(`
        status,
        subject
      `)

      .eq(
        "id",
        requestId
      )

      .maybeSingle();

    if (
      requestError ||
      !request
    ) {

      return NextResponse.json(

        {
          error:
            "Request not found",
        },

        {
          status: 404,
        }
      );
    }

    /*
  SAME STATUS BLOCK
*/

if (
  request?.status ===
  newStatus
) {

  return NextResponse.json(

    {
      error:
        "Status already set",
    },

    {
      status: 400,
    }
  );
}

    /*
      UPDATE REQUEST
    */

    const {

      error: updateError,

    } = await supabase

      .from(requestTable)

      .update({

        status:
          newStatus,

        last_activity_at:
          new Date()
            .toISOString(),

      })

      .eq(
        "id",
        requestId
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
      INSERT EVENT
    */

    const {

      error: eventError,

    } = await supabase

      .from("request_events")

      .insert({

        request_table:
          requestTable,

        request_id:
          requestId,

        event_type:
          "override",

        actor_id:
          adminId,

        actor_name:
          adminName,

        metadata: {

          from:
            request.status,

          to:
            newStatus,

          reason,
        },

        created_at:
          new Date()
            .toISOString(),
      });

    if (eventError) {

      return NextResponse.json(

        {
          error:
            eventError.message,
        },

        {
          status: 500,
        }
      );
    }

    /*
      SUCCESS
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