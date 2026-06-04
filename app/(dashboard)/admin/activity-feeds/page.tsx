"use client"

import { useEffect, useState } from "react"
import StyledDropdown from "@/components/StyledDropdown"
import { motion } from "framer-motion"

const API = "/api/activity"

type Activity = {
  id: number
  action: string
  type: string
  created_at: string
  username?: string
  employee_name?: string
details?: {
  name: string
  amount: any
}[]
}

export default function ActivityFeedsPage(){

  const [activities,setActivities] = useState<Activity[]>([])
  const [loading,setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [userFilter, setUserFilter] = useState("")
const [typeFilter, setTypeFilter] = useState("")
const [expanded,setExpanded] =
  useState<number | null>(null)

const PAGE_SIZE = 20

  console.log("PAGE LOADED")

useEffect(() => {
  console.log("COMPONENT MOUNTED")

  const run = async () => {
    console.log("FETCH START")

    try {
      const res = await fetch(`${window.location.origin}/api/activity`)

      if (!res.ok) {
        const text = await res.text()
        console.error("API ERROR:", res.status, text)
        setActivities([])
        setLoading(false)
        return
      }

const data = await res.json()

console.log("FULL API RESPONSE:", data)

if (data.error) {
  console.error("SERVER ERROR:", data.error)
  setActivities([])
  return
}

console.log("LOGS:", data.logs)

setActivities(Array.isArray(data.logs) ? data.logs : [])

    } catch (err) {
      console.error("Activity load error:", err)
      setActivities([])
    }

    setLoading(false)
  }

  run()
}, [])

const filteredActivities = activities.filter((item) => {

  const matchesUser =
    !userFilter ||
    item.username === userFilter

  const matchesType =
    !typeFilter ||
    item.type === typeFilter

  return matchesUser && matchesType
})

const totalPages = Math.ceil(
  filteredActivities.length / PAGE_SIZE
)

const paginatedActivities = filteredActivities.slice(
  page * PAGE_SIZE,
  page * PAGE_SIZE + PAGE_SIZE
)

const uniqueUsers = [
  ...new Set(
    activities
      .map((a) =>
        a.username?.trim()
      )
      .filter(Boolean)
  ),
].sort()

const uniqueTypes = [
  ...new Set(
    activities
      .map((a) => a.type)
      .filter(Boolean)
  ),
]

  function formatDate(date:string){
    return new Date(date).toLocaleString()
  }

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading activity feed...
      </div>
    )
  }


  return(

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Activity Feed
      </h1>

<div className="flex gap-4 mb-6">

  <StyledDropdown
    placeholder="All Users"
    value={userFilter}
    onChange={(value) => {
      setUserFilter(value)
      setPage(0)
    }}
    width="220px"
    options={[
      {
        id: "",
        name: "All Users",
      },

      ...uniqueUsers.map((user) => ({
        id: user || "",
        name: user || "",
      })),
    ]}
  />

  <StyledDropdown
    placeholder="All Types"
    value={typeFilter}
    onChange={(value) => {
      setTypeFilter(value)
      setPage(0)
    }}
    width="220px"
    options={[
      {
        id: "",
        name: "All Types",
      },

...uniqueTypes.map((type) => ({
  id: type || "",
  name:
    type
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "",
}))
    ]}
  />

</div>

<div className="flex flex-col gap-3">

 <div className="
  grid grid-cols-[3.2fr_1fr_1.2fr_1.8fr_2.8fr]
  gap-6
  px-6 py-2
  text-sm font-semibold text-emerald-700
">
<div>Action</div>
<div>Type</div>
<div>User</div>
<div>Employee</div>
<div>Date</div>
        </div>

        {!loading && activities.length === 0 && (
          <div className="p-6 text-gray-500 text-sm">
            No activity yet
          </div>
        )}

<motion.div

  key={page}
  className="flex flex-col gap-3"
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  }}
>

{paginatedActivities.map((item) => (

  <div
    key={item.id}
    className="flex flex-col"
  >

<motion.div

  onClick={() => {

const expandableTypes = [

  "inventory_restock",

  "inventory_usage",

  "complaint_request",

  "event_request",

  "general_request",

  "hours_exception",

  "incident_report",

  "loa_request",
]

    if (
      expandableTypes.includes(item.type)
    ) {

      setExpanded(

        expanded === item.id
          ? null
          : item.id
      )
    }
  }}
  
      variants={{
        hidden: {
          opacity: 0,
          y: 12,
        },
        show: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{
        duration: 0.25,
      }}
     className={`
  ${

[
  "inventory_restock",

  "inventory_usage",

  "complaint_request",

  "event_request",

  "general_request",

  "hours_exception",

  "incident_report",

  "loa_request",
]

    .includes(item.type)
      ? "cursor-pointer"
      : ""
  }

  grid grid-cols-[3.2fr_1fr_1.2fr_1.8fr_2.8fr]
  items-center gap-6
  bg-white
  rounded-xl
  shadow
  px-6 py-5
  text-sm
  border border-emerald-100
`}
    >

      <div className="text-emerald-700 font-medium">
        {item.action}
      </div>

      <div className="text-emerald-700 font-medium capitalize">
        {item.type?.replaceAll("_", " ") || "-"}
      </div>

      <div className="text-emerald-700 font-medium">
        {item.username || "-"}
      </div>

      <div className="text-emerald-600">
        {item.employee_name || "-"}
      </div>

      <div className="text-emerald-700/70 text-sm whitespace-nowrap">
        {formatDate(item.created_at)}
      </div>

    </motion.div>

{[
  "inventory_restock",
  "inventory_usage"
].includes(item.type) &&

expanded === item.id && (

  <div
    className="
      bg-white
      border
      border-emerald-100
      border-t-0
      rounded-b-xl
      shadow
      px-6
      py-4
      -mt-3
    "
  >

    <div
      className="
        grid
        grid-cols-2
        gap-2
        text-sm
        text-emerald-700
      "
    >

      {item.details?.length ? (

        item.details.map((d, i) => (

          <div
            key={i}
            className="
              flex
              justify-between
              bg-emerald-50
              rounded-lg
              px-3
              py-2
            "
          >

            <span>
              {d.name}
            </span>

<span className="font-semibold">

  {[
    "inventory_restock",
    "inventory_usage"
  ].includes(item.type)

    ? (
        item.type ===
        "inventory_usage"
      )
        ? "-"
        : "+"

    : ""}

  {d.amount}

</span>

          </div>

        ))

      ) : (

        <div className="text-emerald-600 text-sm">
          No detail data saved for this activity
        </div>

      )}

    </div>

  </div>

)}

  </div>

))}

</motion.div>

<div className="flex justify-center items-center gap-4 mt-6">

  <button
    onClick={() => setPage((p) => Math.max(p - 1, 0))}
    disabled={page === 0}
    className="
      px-4 py-2
      rounded-lg
      bg-white
      border border-emerald-200
      text-emerald-700
      shadow-sm
      disabled:opacity-40
    "
  >
    Prev
  </button>

  <div className="text-sm font-semibold text-emerald-700">
    Page {page + 1} / {totalPages || 1}
  </div>

  <button
    onClick={() =>
      setPage((p) => Math.min(p + 1, totalPages - 1))
    }
    disabled={page >= totalPages - 1}
    className="
      px-4 py-2
      rounded-lg
      bg-white
      border border-emerald-200
      text-emerald-700
      shadow-sm
      disabled:opacity-40
    "
  >
    Next
  </button>

</div>

      </div>

    </div>
    

  )

}