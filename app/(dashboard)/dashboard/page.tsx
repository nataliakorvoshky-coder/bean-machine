import OnlineUsers from "@/components/OnlineUsers"

async function getUsers() {

  const res = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + "/api/admin/list-users",
    { cache: "no-store" }
  )

  const data = await res.json()

  return data.users || []
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