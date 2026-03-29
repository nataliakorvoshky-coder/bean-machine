"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"

/* FIELD */
function Field({ label, value }: { label: string; value: any }) {
  const display =
    value === null ||
    value === undefined ||
    value === ""
      ? "N/A"
      : value

  const isEmpty = display === "N/A"

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-emerald-600 uppercase tracking-wide">
        {label}
      </span>

      <span
        className={`text-lg font-semibold break-words ${
          isEmpty ? "text-gray-400 italic" : "text-gray-800"
        }`}
      >
        {display}
      </span>
    </div>
  )
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)

    /* ========================= */
  /* 🔥 ANIMATIONS             */
  /* ========================= */

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel("applications-live")

      /* ➕ INSERT */
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        (payload) => {
          const newApp = payload.new

          setApps((prev) => {
            if (prev.find((a) => a.id === newApp.id)) return prev
            return [newApp, ...prev]
          })
        }
      )

      /* 🗑 DELETE */
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "applications" },
        (payload) => {
          const deletedId = payload.old.id

          setApps((prev) => prev.filter((a) => a.id !== deletedId))

          setIndex((prev) => Math.max(0, prev - 1))
        }
      )

      /* 🔄 UPDATE */
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications" },
        (payload) => {
          const updated = payload.new

          setApps((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          )
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* keep index valid */
  useEffect(() => {
    if (index >= apps.length) {
      setIndex(0)
    }
  }, [apps])

  async function load() {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })

    setApps(data || [])
    setLoading(false)
  }

  /* 🗑 DELETE */
  async function deleteApp(id: string) {
    try {
      await fetch("/api/external/delete", { // ✅ FIXED ROUTE
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      // ❌ REMOVE THIS (Realtime handles it)
      // setApps(...)
      // setIndex(...)

    } catch (err) {
      console.error(err)
      alert("Failed to delete")
    }
  }

  function next() {
    if (apps.length <= 1) return
    setIndex((prev) => (prev + 1) % apps.length)
  }

  function prev() {
    if (apps.length <= 1) return
    setIndex((prev) => (prev - 1 + apps.length) % apps.length)
  }

  if (loading) {
    return <div className="p-10 text-gray-500">Loading...</div>
  }

  if (apps.length === 0) {
    return <div className="p-10 text-gray-500">No applications</div>
  }

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="max-w-5xl mx-auto py-12 px-6"
    >

      {/* ✅ HEADER ALWAYS SHOWS */}
      <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">
        Applications
      </h1>

            {/* 🔄 LOADING */}
      {loading && (
        <div className="text-center text-gray-500">Loading...</div>
      )}

      {/* ❌ EMPTY STATE (BUT HEADER STILL THERE) */}
      {!loading && apps.length === 0 && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="show"
          className="text-center text-gray-500"
        >
          No applications
        </motion.div>
      )}

      {/* ✅ NORMAL CONTENT */}
      {!loading && apps.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
   >

      {/* NAV */}
      <motion.div
        variants={panelVariants}
        className="flex items-center justify-between mb-6"
      >

        <button
          onClick={prev}
          className="p-4 rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition text-xl font-bold"
        >
          ←
        </button>

        <div className="text-sm text-emerald-600 font-semibold">
          {index + 1} / {apps.length}
        </div>

        <button
          onClick={next}
          className="p-4 rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition text-xl font-bold"
        >
          →
        </button>
</motion.div>

      {/* SLIDER */}
      <motion.div variants={panelVariants} className="overflow-hidden relative">

        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >

          {apps.map((app, i) => (
            <div
              key={app.id ?? i}
              className="min-w-full bg-white rounded-xl p-10 shadow border border-emerald-300 flex flex-col"
            >

              {/* HEADER */}
              <div className="flex justify-between mb-8">

                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {app.name || "Unknown Applicant"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    CID: {app.cid || "N/A"}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-emerald-600 font-semibold">
                    {app.created_at
                      ? new Date(app.created_at).toLocaleString()
                      : ""}
                  </div>

                  <button
                    onClick={() => deleteApp(app.id)}
                    className="mt-2 text-red-600 border border-red-500 px-3 py-1 rounded hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>

              </div>

              {/* BASIC */}
              <div className="mb-10">
                <h3 className="text-emerald-700 font-bold text-lg mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <Field label="Discord" value={app.discord} />
                  <Field label="Phone" value={app.phone} />
                  <Field label="Timezone" value={app.timezone} />
                  <Field label="Age" value={app.age} />
                  <Field label="In-City Age" value={app.in_city_age} />
                  <Field label="Time in City" value={app.time_in_city} />
                </div>
              </div>

              {/* WORK */}
              <div className="mb-10">
                <h3 className="text-emerald-700 font-bold text-lg mb-4">
                  Work & Availability
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <Field label="Experience" value={app.experience} />
                  <Field label="Activity" value={app.activity_level} />
                  <Field label="Weekly Hours" value={app.weekly_hours} />
                  <Field label="Night Shift" value={app.night_shift} />
                  <Field label="Gang Member" value={app.gang_member} />
                  <Field label="GZ Acknowledgement" value={app.gz_ack} />
                </div>
              </div>

              {/* WHY JOIN */}
              <div>
                <h3 className="text-emerald-700 font-bold text-lg mb-3">
                  Why Join?
                </h3>

                <div className="bg-gray-50 p-6 rounded-lg border border-emerald-100 text-gray-700 text-base leading-relaxed whitespace-pre-line break-words min-h-[80px]">
                  {app.why_join || "No response"}
                </div>
              </div>

            </div>
  ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}