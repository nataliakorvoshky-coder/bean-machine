"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { initRealtime } from "@/lib/realtime";
import StyledDatePicker from "@/components/StyledDatePicker";
import StyledDropdown from "@/components/StyledDropdown";

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
const [dateFilter, setDateFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editType, setEditType] = useState<any>({});
  const [showAllActivity, setShowAllActivity] = useState<any>({});
 


useEffect(() => {
  async function init() {
    await loadRequests();

    const cleanup = initRealtime({
      onRequestUpdate: (payload) => {
        setRequests((prev) => {
          const exists = prev.find((r) => r.id === payload.new.id);

          if (exists) {
            return prev.map((r) =>
              r.id === payload.new.id ? payload.new : r
            );
          }

          return [payload.new, ...prev];
        });
      },
    });

    return cleanup;
  }

  let cleanupFn: any;

  init().then((cleanup) => {
    cleanupFn = cleanup;
  });

  return () => {
    if (cleanupFn) cleanupFn();
  };
}, []);

async function loadRequests() {
  const res = await fetch("/api/requests/me");
  const data = await res.json();

  console.log("LOADED REQUESTS:", data);
  console.log("SETTING REQUESTS:", data);

  if (Array.isArray(data)) {
    setRequests(data);
  }
}

async function updateRequest(id: string) {
  console.log("SENDING ID:", id);

  if (!id) {
    console.error("❌ updateRequest called with undefined id");
    return;
  }

  const payload = editData[id];

  console.log("PAYLOAD:", payload);

  if (!payload) {
    console.error("❌ Missing payload for id:", id);
    return;
  }

  const res = await fetch(`/api/requests/update/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  console.log("API RESPONSE:", data);

  if (!res.ok) {
    alert(data.error || "Update failed");
    return;
  }

  loadRequests(); // refresh UI
}

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

useEffect(() => {
  console.log("UPDATED REQUESTS STATE:", requests);
}, [requests]);
  
  return (
    <div className="max-w-[1050px] mx-auto pt-10 pb-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        My Requests
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">

  {/* STATUS FILTER */}
  {["All", "Pending", "Viewed", "In Progress", "Approved", "Denied"].map((s) => (
    <button
      key={s}
      onClick={() => setStatusFilter(s)}
      className={`px-3 py-1 rounded-md text-sm ${
        statusFilter === s
          ? "bg-emerald-600 text-white"
          : "bg-white border text-emerald-700"
      }`}
    >
      {s}
    </button>
  ))}

  {/* DATE FILTER */}
  {["All", "Today", "Last 7 Days", "Last 30 Days"].map((d) => (
    <button
      key={d}
      onClick={() => setDateFilter(d)}
      className={`px-3 py-1 rounded-md text-sm ${
        dateFilter === d
          ? "bg-blue-600 text-white"
          : "bg-white border text-blue-600"
      }`}
    >
      {d}
    </button>
  ))}



</div>

      {/* SUBMIT PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow px-6 py-3 mb-6 flex items-center justify-between"
      >
        <div className="text-base font-semibold text-emerald-700">
          Submit Request
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => (window.location.href = "/requests/new/loa")}
            className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-md hover:bg-emerald-700 transition"
          >
            LOA / ROA
          </button>

          <button
            onClick={() => (window.location.href = "/requests/new/hours")}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition"
          >
            Hours Exception
          </button>
        </div>
      </motion.div>

      {/* HEADERS */}
      <div className="grid grid-cols-[1.2fr_2.2fr_2.2fr_1.2fr_1.6fr] gap-10 text-sm font-semibold text-emerald-700 px-6 mb-3 border-b border-emerald-100 pb-2">
        <div>Type</div>
        <div className="text-center">Date Submitted</div>
        <div className="text-center">End Date</div>
        <div className="text-center">Status</div>
        <div className="text-right">Answered By</div>
      </div>

      {/* ROWS */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.07,
            },
          },
        }}
      >
        <AnimatePresence>
          {requests.map((req) => {
  console.log("REQ:", req); // ✅ ADD THIS
            const isOpen = expanded === req.id;

            return (
              <motion.div
                key={req.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ duration: 0.25 }}
                className="bg-white shadow rounded-xl px-6 py-3 mb-3 cursor-pointer"
                onClick={() => toggle(req.id)}
              >
                {/* ROW */}
                <div className="grid grid-cols-[1.2fr_2.2fr_2.2fr_1.2fr_1.6fr] gap-10 items-center">
                  
                  <div className="text-emerald-700 font-medium">
                    {req.type}
                  </div>

                  <div className="text-center text-emerald-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>

                  <div className="text-center text-emerald-600">
                    {req.end_date
                      ? new Date(req.end_date).toLocaleDateString()
                      : "—"}
                  </div>

                  <div className="text-center">
<span
  className={`px-3 py-[2px] rounded-full text-xs font-semibold ${
    req.status === "Approved"
      ? "bg-emerald-100 text-emerald-700"
      : req.status === "Denied"
      ? "bg-red-100 text-red-600"
      : req.status === "In Progress"
      ? "bg-blue-100 text-blue-600"
      : req.status === "Viewed"
      ? "bg-purple-100 text-purple-600"
      : req.status === "Pending"
      ? "bg-gray-100 text-gray-600"
      : "bg-gray-100 text-gray-600"
  }`}
>
  {req.status}
</span>
                  </div>

                  <div className="flex justify-end items-center gap-3">
                    <span className="text-emerald-600">
                      {req.answered_by || "—"}
                    </span>

                    <span className="text-emerald-500 text-xs">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* EXPANDED */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-emerald-200 pt-4 text-sm"
                    >
<div className="space-y-4">

  {/* REASON */}
  <div>
    <div className="text-[11px] font-semibold text-emerald-700 mb-1 tracking-wide">
      REASON
    </div>
    <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md px-3 py-2">
      {req.reason || "No reason provided"}
    </div>
  </div>

{req.notes_history?.length > 0 && (
  <div className="space-y-3">

    <div className="text-[11px] font-semibold text-emerald-700 tracking-wide">
      ACTIVITY
    </div>

    <div className="relative pl-4 border-l-2 border-emerald-200 space-y-3">

      {(() => {
  const reversed = [...req.notes_history].reverse();
  const showAll = showAllActivity[req.id];

  const visible = showAll ? reversed : reversed.slice(0, 1);

  return visible.map((entry: any, i: number) => (

        <div key={i} className="relative">

          {/* DOT */}
          <div className="absolute -left-[7px] top-2 w-3 h-3 bg-emerald-500 rounded-full"></div>

          {/* CARD */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-md px-3 py-2">

            {/* TEXT */}
            <div className="text-sm text-emerald-800">
              {entry.text}
            </div>

            {/* META */}
            <div className="flex justify-between text-xs text-emerald-600 mt-1">
              <span>{entry.by}</span>
              <span>{new Date(entry.at).toLocaleString()}</span>
            </div>

            {/* TYPE BADGE */}
            <span
              className={`mt-1 inline-block text-[10px] px-2 py-[2px] rounded-full font-semibold
                ${
                  entry.type === "Approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : entry.type === "Denied"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }
              `}
            >
              {entry.type}
            </span>

          </div>
        </div>  

));
})()}

</div>

{/* 🔽 SHOW MORE / LESS BUTTON */}
{req.notes_history.length > 1 && (
  <div className="pl-4">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowAllActivity((prev: any) => ({
          ...prev,
          [req.id]: !prev[req.id],
        }));
      }}
      className="text-xs text-blue-600 hover:underline mt-1"
    >
      {showAllActivity[req.id] ? "Show less" : "Show all activity"}
    </button>
  </div>
)}

</div>

)}

  {/* DATE RANGE */}
  {req.start_date && (
    <div>
      <div className="text-[11px] font-semibold text-emerald-700 mb-1 tracking-wide">
        DATE RANGE
      </div>
      <div className="text-sm text-emerald-700 bg-white border border-emerald-200 rounded-md px-3 py-2">
        {req.start_date} → {req.end_date}
      </div>
    </div>
  )}

  {/* HOURS */}
  {req.hours_requested && (
    <div>
      <div className="text-[11px] font-semibold text-emerald-700 mb-1 tracking-wide">
        REQUESTED HOURS
      </div>
      <div className="text-sm text-emerald-700 bg-white border border-emerald-200 rounded-md px-3 py-2">
        {req.hours_requested}
      </div>
    </div>
  )}
  
{/* 🔥 UPDATE REQUEST (ONLY LOA / ROA) */}
{(req.type === "LOA" || req.type === "ROA") && (
  <div
    className="mt-4 border-t pt-4"
    onClick={(e) => e.stopPropagation()} // ✅ THIS LINE IS THE FIX
  >

    <div className="text-xs font-semibold text-blue-700 mb-2">
      UPDATE REQUEST
    </div>

<StyledDropdown
  placeholder="Select update type"
  value={editType[req.id] || ""}
  onChange={(value) =>
    setEditType((prev: any) => ({
      ...prev,
      [req.id]: value,
    }))
  }
  options={[
    { id: "extend", name: "Request Extension" },
    { id: "early", name: "Request Early Return" },
    { id: "start", name: "Change Start Date" },
  ]}
  className="w-full"
/>

{/* ✅ WRAPPER */}
<div
  className={
    editType[req.id]
      ? "flex flex-col gap-3 mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3"
      : "flex flex-col gap-2 mt-2"
  }
>

  {/* ✅ DATE + TITLE */}
  {editType[req.id] && (
    <>
      <div className="text-[11px] font-semibold text-emerald-700 tracking-wide">
        {editType[req.id] === "start"
          ? "Change Start Date"
          : "Update End Date"}
      </div>

      <StyledDatePicker
        value={
          editType[req.id] === "start"
            ? editData[req.id]?.start_date || ""
            : editData[req.id]?.end_date || ""
        }
        onChange={(value) =>
          setEditData((prev: any) => ({
            ...prev,
            [req.id]: {
              ...(prev[req.id] || {}),
              ...(editType[req.id] === "start"
                ? { start_date: value }
                : { end_date: value }),
              type:
                editType[req.id] === "start"
                  ? "Start Change"
                  : editType[req.id] === "early"
                  ? "Early Return"
                  : "Extension",
            },
          }))
        }
      />
    </>
  )}

  {/* ✅ NOTE */}
<input
  type="text"
  placeholder="Add note..."
  value={editData[req.id]?.note || ""} // ✅ ADD THIS
  className="
    border border-emerald-300 rounded-lg px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-emerald-500
    focus:bg-emerald-50 transition
  "
  onClick={(e) => e.stopPropagation()}
  onChange={(e) =>
    setEditData((prev: any) => ({
      ...prev,
      [req.id]: {
        ...(prev[req.id] || {}),
        note: e.target.value,
        type: prev[req.id]?.type || "Note",
      },
    }))
  }
/>

  {/* ✅ SAVE BUTTON (YOUR ORIGINAL LOGIC PRESERVED) */}
<div className="flex gap-2 mt-2">

  {/* 📝 SEND NOTE */}
  <button
    onClick={(e) => {
      e.stopPropagation();

      const id = req?.id;
      if (!id) return;

      if (!editData[req.id]?.note) return; // ✅ prevent empty

      updateRequest(id);

      // ✅ CLEAR INPUT
      setEditData((prev: any) => ({
        ...prev,
        [req.id]: {},
      }));
    }}
    disabled={!editData[req.id]?.note}
    className="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-40"
  >
    Send Note
  </button>

  {/* 🔥 SUBMIT UPDATE */}
  <button
    onClick={(e) => {
      e.stopPropagation();

      const id = req?.id;
      if (!id || typeof id !== "string") return;

      if (!editType[req.id]) return;

      updateRequest(id);

      setEditData((prev: any) => ({
        ...prev,
        [req.id]: {},
      }));

      setEditType((prev: any) => ({
        ...prev,
        [req.id]: "",
      }));
    }}
    disabled={!editType[req.id]}
    className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-40"
  >
    Submit Update
  </button>

</div>

</div>
  </div>
  
)}

</div>



                      {req.hours_requested && (
                        <div className="text-gray-600">
                          Requested Hours: {req.hours_requested}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}