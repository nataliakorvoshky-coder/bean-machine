import OnlineUsers from "@/components/OnlineUsers"
import { createClient } from "@supabase/supabase-js"

async function getUsers() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from("profiles")
    .select("id, username")

  return data || []
}

export default async function DashboardPage() {

  const users = await getUsers()

  return (

    <div className="w-[1000px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Dashboard
      </h1>

      <div className="flex gap-12">

        <OnlineUsers users={users} />

        <div className="w-[420px] bg-white p-8 rounded-xl shadow">

          <h2 className="font-semibold mb-6 text-emerald-700">
            Activity Feed
          </h2>

          <p className="text-gray-500 text-sm">
            No activity yet
          </p>

        </div>

      </div>

    </div>

  )

}