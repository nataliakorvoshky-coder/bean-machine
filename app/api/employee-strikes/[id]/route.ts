import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } } // 🔥 fix type too
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { id } = params // ✅ no await needed

    const { error } = await supabase
      .from("employee_strikes")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}