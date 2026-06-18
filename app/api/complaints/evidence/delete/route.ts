import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  const {
    evidenceId,
  } = await req.json();

  const { error } =
    await supabase

      .from(
        "complaint_evidence"
      )

      .delete()

      .eq(
        "id",
        evidenceId
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
  });

}