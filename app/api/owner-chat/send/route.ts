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

      !body.complaint_id ||

      !body.user_id ||

      (
        !body.message &&

        (
          !body.attachments ||

          body.attachments.length === 0
        )
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
        "owner_chat_messages"
      )

      .insert({

        complaint_id:
          body.complaint_id,

        sender_id:
          body.user_id,

        sender_name:
          body.sender_name,

        sender_role:
          body.sender_role,

        is_admin:
          body.is_admin || false,

        is_manager:
          body.is_manager || false,

        is_supervisor:
          body.is_supervisor || false,

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