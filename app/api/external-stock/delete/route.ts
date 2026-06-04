import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const { id } = body

    const { error } =
      await supabase

        .from("external_stock")

        .delete()

        .eq("id", id)

    if (error) {

      return NextResponse.json(
        {
          error: error.message
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message
      },
      {
        status: 500
      }
    )
  }
}