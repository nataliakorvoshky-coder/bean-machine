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

  !body.ticket_id ||

  !body.request_type ||

  !body.user_id ||

  (
    !body.message &&
    (!body.attachments ||
      body.attachments.length === 0)
  )
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
      CREATE MESSAGE
    */

    const {
      data,
      error,
    } = await supabase

      .from(
        "request_comments"
      )

.insert({

  request_id:
    body.ticket_id,

  request_type:
    body.request_type,

  sender_id:
    body.user_id,

sender_name:
  body.sender_name,

  sender_role:
    body.sender_role,

  message:
    body.message,

  attachment_url:
    body.attachment_url || null,

  attachments:
    body.attachments || [],

  edited:
    false,

  deleted:
    false,

  created_at:
    new Date()
      .toISOString(),
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
  UPDATE TICKET ACTIVITY
*/

await supabase

  .from(
    "hours_exception_requests"
  )

  .update({

    last_activity_at:
      new Date()
        .toISOString(),
  })

  .eq(
    "id",
    body.ticket_id
  );

/*
  RESPONSE
*/

return NextResponse.json({

  success: true,

  message:
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