import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  try {

    const {

      evidenceId,

      title,

      description,

    } = await req.json();

    if (!evidenceId) {

      return NextResponse.json(

        {
          error:
            "Missing evidenceId",
        },

        {
          status: 400,
        }
      );
    }

    /*
      UPDATE EVIDENCE
    */

    const {

      data,

      error,

    } = await supabase

      .from(
        "complaint_evidence"
      )

      .update({

        title,

        description,

      })

      .eq(
        "id",
        evidenceId
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

      evidence:
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