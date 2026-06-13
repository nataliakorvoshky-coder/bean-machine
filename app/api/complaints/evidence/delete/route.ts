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
      LOAD EVIDENCE
    */

    const {
      data: evidence,
      error: loadError,
    } = await supabase

      .from(
        "complaint_evidence"
      )

      .select("*")

      .eq(
        "id",
        evidenceId
      )

      .single();

    if (
      loadError ||
      !evidence
    ) {

      return NextResponse.json(

        {
          error:
            "Evidence not found",
        },

        {
          status: 404,
        }
      );
    }

    /*
      DELETE DB RECORD
    */

    const {
      error: deleteError,
    } = await supabase

      .from(
        "complaint_evidence"
      )

      .delete()

      .eq(
        "id",
        evidenceId
      );

    if (deleteError) {

      return NextResponse.json(

        {
          error:
            deleteError.message,
        },

        {
          status: 500,
        }
      );
    }

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