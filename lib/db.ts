import { createClient } from "@supabase/supabase-js"
import { logActivity } from "@/lib/logActivity"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export const db = {

  async insert(table: string, data: any, log?: any) {
    const res = await supabase.from(table).insert(data)

    if (!res.error && log) {
      await logActivity(log)
    }

    return res
  },

  async update(table: string, data: any, match: any, log?: any) {
    const res = await supabase.from(table).update(data).match(match)

    if (!res.error && log) {
      await logActivity(log)
    }

    return res
  },

  async delete(table: string, match: any, log?: any) {
    const res = await supabase.from(table).delete().match(match)

    if (!res.error && log) {
      await logActivity(log)
    }

    return res
  }

}