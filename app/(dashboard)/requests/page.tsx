"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { initRealtime } from "@/lib/realtime";

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);


useEffect(() => {
  loadRequests();
}, []);

  async function loadRequests() {
    const res = await fetch("/api/requests/me");
    const data = await res.json();
    setRequests(data || []);
  }

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-[1050px] mx-auto pt-10 pb-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        My Requests
      </h1>

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
                      className="mt-4 border-t pt-4 text-sm"
                    >
                      <div className="text-emerald-700 mb-2">
                        {req.reason}
                      </div>

                      {req.start_date && (
                        <div className="text-gray-600">
                          {req.start_date} → {req.end_date}
                        </div>
                      )}

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