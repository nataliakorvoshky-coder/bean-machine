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

    if (
      !body.member_id
    ) {

      return NextResponse.json(

        {
          error:
            "Missing member_id"
        },

        {
          status: 400
        }
      );

    }

    await supabase

      .from(
        "owner_chat_members"
      )

      .delete()

      .eq(
        "id",
        body.member_id
      );

    return NextResponse.json({

      success: true

    });

  } catch (err: any) {

    return NextResponse.json(

      {
        error:
          err.message
      },

      {
        status: 500
      }
    );

  }

}