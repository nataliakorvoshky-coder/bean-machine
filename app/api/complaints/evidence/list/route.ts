import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  try {

    const {
      complaintId,
    } = await req.json();

    if (!complaintId) {

      return NextResponse.json(

        {
          error:
            "Missing complaintId",
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

      data,

      error,

    } = await supabase

      .from(
        "complaint_evidence"
      )

      .select("*")

      .eq(
        "complaint_id",
        complaintId
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );

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
        data || [],
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