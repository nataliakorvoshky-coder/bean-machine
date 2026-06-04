import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {
      name,
      section,
      current_amount,
      goal_amount
    } = body

    if (!name?.trim()) {

      return NextResponse.json(
        {
          error:
            "Name required"
        },
        {
          status: 400
        }
      )
    }

    const { data, error } =
      await supabase

        .from("stock_items")

        .insert([{
          name,
          section,
          current_amount,
          goal_amount
        }])

        .select()

        .single()

    if (error) {

      console.error(
        "Create stock item error:",
        error
      )

      return NextResponse.json(
        {
          error:
            error.message
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      success: true,
      item: data
    })

  } catch (err: any) {

    console.error(
      "Create stock crash:",
      err
    )

    return NextResponse.json(
      {
        error:
          err.message
      },
      {
        status: 500
      }
    )
  }
}