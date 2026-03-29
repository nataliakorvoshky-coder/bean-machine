import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { roleId, page, type, value } = await req.json()

    const column = type === "view" ? "can_view" : "can_edit"

    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("role_id", roleId)
      .eq("page", page)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("permissions")
        .update({ [column]: value })
        .eq("id", data.id)

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

    } else {
      const { error: insertError } = await supabase
        .from("permissions")
        .insert({
          role_id: roleId,
          page,
          can_view: type === "view" ? value : false,
          can_edit: type === "edit" ? value : false
        })

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}