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

      !body.emoji

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

      data: message,

      error: fetchError,

    } = await supabase

      .from(
        "owner_chat_messages"
      )

      .select(`
        id,
        reactions
      `)

      .eq(
        "id",
        body.message_id
      )

      .maybeSingle();

    if (

      fetchError ||

      !message

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
      EXISTING REACTIONS
    */

    const reactions =
      message.reactions || [];

    /*
      CHECK EXISTING REACTION
    */

    const existingIndex =
      reactions.findIndex(
        (r: any) =>

          r.user_id ===
            body.user_id &&

          r.emoji ===
            body.emoji
      );

    /*
      TOGGLE REACTION
    */

    if (
      existingIndex >= 0
    ) {

      reactions.splice(
        existingIndex,
        1
      );

    } else {

      reactions.push({

        user_id:
          body.user_id,

        emoji:
          body.emoji,

        created_at:
          new Date()
            .toISOString(),

      });

    }

    /*
      UPDATE MESSAGE
    */

    const {

      data,

      error,

    } = await supabase

      .from(
        "owner_chat_messages"
      )

      .update({

        reactions,

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