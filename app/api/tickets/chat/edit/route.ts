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
      !body.message_id ||
      !body.user_id ||
      !body.message
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
      GET MESSAGE
    */

    const {
      data: existingMessage,
      error: fetchError,
    } = await supabase

      .from(
        "request_comments"
      )

      .select(`
        id,
         sender_id,
        deleted
      `)

      .eq(
        "id",
        body.message_id
      )

      .maybeSingle();

    if (
      fetchError ||
      !existingMessage
    ) {

      return NextResponse.json(

        {
          error:
            "Message not found",
        },

        {
          status: 404,
        }
      );
    }

    /*
      PERMISSION CHECK
    */

if (
  existingMessage.sender_id !==
  body.user_id
){

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
      PREVENT EDITING
      DELETED MESSAGES
    */

    if (
      existingMessage.deleted
    ) {

      return NextResponse.json(

        {
          error:
            "Cannot edit deleted message",
        },

        {
          status: 400,
        }
      );
    }

    /*
      UPDATE MESSAGE
    */

    const {
      data,
      error,
    } = await supabase

      .from(
        "request_comments"
      )

      .update({

message:
  body.message,

        edited:
          true,

        edited_at:
          new Date()
            .toISOString(),
      })

      .eq(
        "id",
        body.message_id
      )

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