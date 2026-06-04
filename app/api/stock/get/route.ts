import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/* ✅ DISABLE NEXT CACHE */
export const dynamic = "force-dynamic"

export async function GET() {

  const { data, error } =
    await supabase

      .from("stock_items")

      .select("*")

      .order("name", {
        ascending: true
      })

  if (error) {

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate"
        }
      }
    )
  }

  return NextResponse.json(
    {
      items: data || []
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate"
      }
    }
  )
}