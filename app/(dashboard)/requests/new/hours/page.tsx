"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import StyledDropdown from "@/components/StyledDropdown";
import StyledMonthPicker from "@/components/StyledMonthPicker";
import { supabase } from "@/lib/supabase";

export default function HoursRequestPage() {
  const [loading, setLoading] = useState(false);

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [form, setForm] = useState({
    type: "HOURS EXCEPTION",
    reason: "",
    week_start: "",
  });

const [stats, setStats] = useState({
  workedMinutes: 0,
  requiredHours: 0,
  goalMet: false,
});

  /* ========================= */
  /* 🔥 GENERATE WEEKS */
  /* ========================= */
  const weeks = useMemo(() => {
    const result: {
      label: string;
      value: string;
      isCurrent: boolean;
      isFuture: boolean;
    }[] = [];

    const [year, month] = selectedMonth.split("-").map(Number);

    let current = new Date(year, month - 1, 1);

    // go to previous Sunday
    current.setDate(current.getDate() - current.getDay());

    while (current.getMonth() <= month - 1 || current.getDate() <= 7) {
      const start = new Date(current);
      const end = new Date(current);
      end.setDate(start.getDate() + 6);

      const isCurrent =
        today >= start && today <= end;

      const isFuture = start > today;

      result.push({
        label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        value: start.toISOString(),
        isCurrent,
        isFuture,
      });

      current.setDate(current.getDate() + 7);
    }

    return result;
  }, [selectedMonth]);

  /* ========================= */
  /* AUTO SELECT CURRENT WEEK */
  /* ========================= */
  useEffect(() => {
    const currentWeek = weeks.find((w) => w.isCurrent);
    if (currentWeek) {
      setForm((prev) => ({
        ...prev,
        week_start: currentWeek.value,
      }));
    }
  }, [weeks]);

useEffect(() => {
  async function loadStats() {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) return;

    const res = await fetch("/api/user/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    const emp = data.employee;

    if (!emp) return;

setStats({
  workedMinutes:
    (emp.weekly_hours ?? 0) * 60 +
    (emp.weekly_minutes ?? 0),

  requiredHours: emp.required_hours ?? 0,

  goalMet: emp.goal_met ?? false
});
  }

  loadStats();
}, []);

  /* ========================= */
  /* SUBMIT */
  /* ========================= */
  async function handleSubmit() {
    setLoading(true);

    try {
const { data: auth } = await supabase.auth.getUser();
const user = auth?.user;

if (!user) {
  alert("Not logged in");
  return;
}

await fetch("/api/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ...form,

    // 🔥 CRITICAL FIXES
    type: "HOURS EXCEPTION",
    user_id: user.id,
  }),
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
        {/* MONTH SELECT */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Month
          </label>

<StyledMonthPicker
  value={selectedMonth}
  onChange={(val) => setSelectedMonth(val)}
/>
        </div>

        {/* WEEK SELECT */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Week Of (Sunday - Saturday)
          </label>

<StyledDropdown
  placeholder="Select a week"
  value={form.week_start}
  onChange={(val) =>
    setForm({ ...form, week_start: val })
  }
  options={weeks.map((week, i) => ({
    id: week.value,
    name: `${week.isCurrent ? " " : ""}${week.label}${
      week.isFuture ? " (future)" : ""
    }`,
  }))}
  width="100%"
/>
        </div>

        {/* WEEKLY PROGRESS */}
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
  <p className="text-sm font-semibold text-emerald-700 mb-1">
    Weekly Progress
  </p>

  {(() => {
    const worked = stats.workedMinutes;
    const required = stats.requiredHours * 60;

    const h = Math.floor(worked / 60);
    const m = worked % 60;

const percent = required
  ? Math.min((worked / required) * 100, 100)
  : stats.goalMet
  ? 100
  : 0;

    return (
      <>
<p className="text-sm text-gray-700">
  {h}h {m}m worked / {stats.requiredHours}h required
</p>

{stats.goalMet && (
  <p className="text-sm font-semibold text-green-600 mt-1">
    ✅ Goal Met
  </p>
)}

        <div className="w-full h-2 bg-gray-200 rounded mt-2">
<div
  className={`h-2 rounded ${
    stats.goalMet
      ? "bg-green-600"
      : percent >= 75
      ? "bg-emerald-500"
      : percent >= 40
      ? "bg-yellow-400"
      : "bg-red-400"
  }`}
  style={{ width: `${percent}%` }}
/>
        </div>
      </>
    );
  })()}
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
            className="px-4 py-2 text-sm rounded-md border border-emerald-400 text-emerald-700 hover:bg-emerald-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.week_start}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}