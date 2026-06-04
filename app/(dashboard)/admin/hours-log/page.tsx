"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker";
import { motion } from "framer-motion";

export default function HoursLog() {
  const [hoursData, setHoursData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterWorkDate, setFilterWorkDate] = useState("");
  const [filterSubmissionDate, setFilterSubmissionDate] = useState("");
  const [filterHours, setFilterHours] = useState("");

  const [page, setPage] = useState(0);
const PAGE_SIZE = 10;

function clearFilters() {
  setFilterEmployee("");
  setFilterWorkDate("");
  setFilterSubmissionDate("");
  setFilterHours("");
}

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  setPage(0);
}, [filterEmployee, filterWorkDate, filterSubmissionDate, filterHours]);

  async function fetchData() {
    try {
      const { data: hours, error } = await supabase
        .from("work_hours")
        .select("id, hours, minutes, work_date, created_at, employee_id, submitted_by")
        .order("created_at", { ascending: false });

      if (error) return;

      const { data: empData } = await supabase
        .from("employees")
        .select("id, name")
  .in("status", ["Active", "LOA", "ROA"]);

const { data: profiles } = await supabase
  .from("profiles")
  .select("id, employee_id, username");

      const empMap: any = {};
      empData?.forEach((e) => (empMap[e.id] = e.name));

const profileMap: any = {};

profiles?.forEach((p) => {
  profileMap[p.id] = {
    employee_id: p.employee_id,
    username: p.username,
  };
});

      const formatted = (hours || []).map((entry) => ({
        ...entry,
        employee_name: empMap[entry.employee_id] || "Unknown",
submitted_by_name:
  empMap[profileMap[entry.submitted_by]?.employee_id] || "Unknown",

submitted_by_username:
  profileMap[entry.submitted_by]?.username || "Unknown",
      }));

      setHoursData(formatted);
      setEmployees(empData || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

async function handleDelete(
  id: string,
  employee_id: string,
  hours: number,
  minutes: number,
  employee_name: string,
  submitted_by_name: string,
submitted_by_username: string,
) {

  // delete row
  await supabase
    .from("work_hours")
    .delete()
    .eq("id", id)

  // remove locally
  setHoursData((prev) => prev.filter((e) => e.id !== id))

  // update employee totals
  await updateEmployeeData(employee_id, hours, minutes)

  // 🔥 LOG ACTIVITY
  await fetch("/api/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: `Removed ${hours}h ${minutes}m for ${employee_name}`,
      type: "hours_removed",
      userId: null,
      employeeName: employee_name,
      username: submitted_by_username,
    }),
  })
}

  async function updateEmployeeData(employee_id: string, hours: number, minutes: number) {
    const { data: emp } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employee_id)
      .maybeSingle();

    const remove = hours * 60 + minutes;

    const newMinutes = Math.max((emp?.worked_minutes || 0) - remove, 0);
    const newWeekly = Math.max((emp?.weekly_minutes || 0) - remove, 0);

    const newHours = Math.floor(newMinutes / 60);
    const newWeeklyHours = Math.floor(newWeekly / 60);

    const wage = emp?.wage || 0;

    await supabase.from("employees").update({
      worked_minutes: newMinutes,
      paid_hours: newHours,
      weekly_minutes: newWeekly,
      weekly_hours: newWeeklyHours,
      weekly_earnings: newWeeklyHours * wage,
      lifetime_hours: newHours,
      lifetime_earnings: newHours * wage,
    }).eq("id", employee_id);
  }

  const filtered = hoursData
    .filter((e) => {
      if (filterEmployee && e.employee_id !== filterEmployee) return false;
      if (filterWorkDate && e.work_date !== filterWorkDate) return false;

      if (
        filterSubmissionDate &&
        e.created_at &&
        e.created_at.split("T")[0] !== filterSubmissionDate
      ) return false;

      return true;
    })
    .sort((a, b) => {
      const aMin = a.hours * 60 + a.minutes;
      const bMin = b.hours * 60 + b.minutes;

      if (filterHours === "asc") return aMin - bMin;
      if (filterHours === "desc") return bMin - aMin;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

      // ✅ PAGINATION LOGIC
const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

const paginated = filtered.slice(
  page * PAGE_SIZE,
  page * PAGE_SIZE + PAGE_SIZE
);



  return (
    <div className="w-full px-10 py-8">

      {/* ✅ STATIC TITLE */}
      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Hours Log
      </h1>

      {/* ✅ ONLY CONTENT ANIMATES (NO Y SHIFT) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >

        {/* FILTERS */}
        <motion.div
          className="flex gap-4 mb-8 items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >

<div className="w-[220px] flex flex-col relative">
  <label className="text-xs text-emerald-700 font-semibold mb-1">Employee</label>

  {filterEmployee && (
    <button
      onClick={() => setFilterEmployee("")}
className="
  absolute top-[38px] right-16
  text-emerald-500 hover:text-emerald-700
  text-sm leading-none
  z-50
"
    >
      ✕
    </button>
  )}

  <StyledDropdown
    value={filterEmployee}
    onChange={setFilterEmployee}
    placeholder="Select employee"
    options={employees.map(e => ({ id: e.id, name: e.name }))}
  />
</div>

<div className="w-[220px] flex flex-col relative">
  <label className="text-xs text-emerald-700 font-semibold mb-1">Work Date</label>

  {filterWorkDate && (
    <button
      onClick={() => setFilterWorkDate("")}
className="
  absolute top-[38px] right-6
  text-emerald-500 hover:text-emerald-700
  text-sm leading-none
  z-50
"
    >
      ✕
    </button>
  )}

  <StyledDatePicker value={filterWorkDate} onChange={setFilterWorkDate} />
</div>

<div className="w-[220px] flex flex-col relative">
  <label className="text-xs text-emerald-700 font-semibold mb-1">Submission Date</label>

  {filterSubmissionDate && (
    <button
      onClick={() => setFilterSubmissionDate("")}
className="
  absolute top-[38px] right-6
  text-emerald-500 hover:text-emerald-700
  text-sm leading-none
  z-50
"
    >
      ✕
    </button>
  )}

  <StyledDatePicker value={filterSubmissionDate} onChange={setFilterSubmissionDate} />
</div>

<div className="w-[200px] flex flex-col relative">
  <label className="text-xs text-emerald-700 font-semibold mb-1">Sort Time</label>

  {filterHours && (
    <button
      onClick={() => setFilterHours("")}
className="
  absolute top-[38px] right-10
  text-emerald-500 hover:text-emerald-700
  text-sm leading-none
  z-50
"
    >
      ✕
    </button>
  )}

  <StyledDropdown
    value={filterHours}
    onChange={setFilterHours}
    placeholder="Sort"
    options={[
      { id: "asc", name: "Lowest Time" },
      { id: "desc", name: "Highest Time" },
    ]}
  />
</div>


        </motion.div>

        {/* TABLE HEADER */}
        <motion.div
          className="grid grid-cols-[4fr_2fr_2fr_2fr_1fr] text-sm font-semibold text-emerald-700 px-6 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div>Employee</div>
          <div>Time</div>
          <div>Work Date</div>
          <div>Submitted By</div>
          <div></div>
        </motion.div>

        {/* ROWS */}
        <motion.div
  key={page}
  initial={{ x: 100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -100, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {paginated.map((entry, i) => (

          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[4fr_2fr_2fr_2fr_1fr] items-center bg-white shadow rounded-xl px-6 py-2 mb-3 border border-emerald-300 text-emerald-700"
          >
            <div className="font-medium">{entry.employee_name}</div>
            <div>{entry.hours}h {entry.minutes}m</div>
            <div>{entry.work_date || "-"}</div>
            <div>{entry.submitted_by_name}</div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
onClick={() =>
  handleDelete(
    entry.id,
    entry.employee_id,
    entry.hours,
    entry.minutes,
    entry.employee_name,
    entry.submitted_by_name,
    entry.submitted_by_username,
  )
}
            >
              Delete
            </motion.button>
          </motion.div>
          ))}
</motion.div>

            {/* ✅ PAGINATION CONTROLS */}
<div className="flex justify-center items-center gap-4 mt-6">

  <button
    onClick={() => setPage((p) => Math.max(p - 1, 0))}
    disabled={page === 0}
    className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 disabled:opacity-40"
  >
    Prev
  </button>

  <span className="text-sm text-emerald-700 font-semibold">
    Page {page + 1} / {totalPages || 1}
  </span>

  <button
    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
    disabled={page >= totalPages - 1}
    className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 disabled:opacity-40"
  >
    Next
  </button>

</div>

      </motion.div>
    </div>
  );
}