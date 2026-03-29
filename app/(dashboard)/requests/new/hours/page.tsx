"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function HoursRequestPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    type: "HOURS_EXCEPTION",
    reason: "",
    hours_requested: "",
    date: "",
  });

  async function handleSubmit() {
    setLoading(true);

    try {
      await fetch("/api/requests", {
        method: "POST",
        body: JSON.stringify(form),
      });

      window.location.href = "/requests";
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-8">

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Hours Exception Request
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow p-6 space-y-5"
      >
        {/* DATE */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Date
          </label>

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="w-full mt-1 px-4 py-2 rounded-md border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* HOURS */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Requested Hours
          </label>

          <input
            type="number"
            value={form.hours_requested}
            onChange={(e) =>
              setForm({ ...form, hours_requested: e.target.value })
            }
            className="w-full mt-1 px-4 py-2 rounded-md border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* REASON */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Reason
          </label>

          <textarea
            rows={4}
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
            className="w-full mt-1 px-4 py-2 rounded-md border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}