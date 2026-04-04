"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initRealtime } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [note, setNote] = useState("");
  const [presence, setPresence] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const [manager, setManager] = useState("");




  /* ========================= */
  /* 🔥 LOAD DATA              */
  /* ========================= */
  useEffect(() => {
    loadRequests();
  }, []);

async function loadRequests() {
  try {
    const res = await fetch("/api/requests");

    if (!res.ok) {
      console.error("API ERROR:", res.status);
      return;
    }

    const text = await res.text();

    if (!text) {
      console.warn("⚠️ Empty API response");
      setRequests([]);
      return;
    }

    const data = JSON.parse(text);

    setRequests(data || []);
  } catch (err) {
    console.error("LOAD REQUESTS ERROR:", err);
    setRequests([]);
  }
}


useEffect(() => {
  async function loadUser() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) return;

const { data: profile } = await supabase
  .from("profiles")
  .select(`
    employee_id,
    employees (
      name
    )
  `)
  .eq("id", user.id)
  .single();

const employee = Array.isArray(profile?.employees)
  ? profile.employees[0]
  : profile?.employees;

setManager(employee?.name || "Unknown");
  }

  loadUser();
}, []);

  /* ========================= */
  /* 🔴 REALTIME               */
  /* ========================= */
  useEffect(() => {
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

        if (expanded === payload.new.id && !typing) {
          setNote(payload.new.note || "");
        }
      },

      onPresenceUpdate: (payload: any) => {
        setPresence((prev) => {
          const exists = prev.find((p) => p.id === payload.new.id);
          if (exists) {
            return prev.map((p) =>
              p.id === payload.new.id ? payload.new : p
            );
          }
          return [payload.new, ...prev];
        });
      },
    });

    return cleanup;
  }, [expanded, typing]);

  /* ========================= */
  /* 🔄 PRESENCE HEARTBEAT     */
  /* ========================= */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!expanded) return;

      await fetch("/api/requests/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: expanded,
          manager,
          typing,
        }),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [expanded, typing]);

  /* ========================= */
  /* 🔍 FILTER                 */
  /* ========================= */
  const filtered = requests.filter((r) => {
    const name = r.employee_name || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" ? true : r.status === filter)
    );
  });

  function getStatusStyle(status: string) {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Denied":
        return "bg-red-100 text-red-600";
      case "In Progress":
        return "bg-blue-100 text-blue-600";
      case "Viewed":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /* ========================= */
  /* 🔐 ACTIONS                */
  /* ========================= */
async function claim(req: any) {
  await fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager, // ✅ THIS IS NOW REAL
      updates: {
        status: "In Progress",
        claimed_by: manager,
        claimed_at: new Date().toISOString(),
      },
    }),
  });
}
  async function updateNote(reqId: string, value: string) {
    setNote(value);
    setTyping(true);

    await fetch("/api/requests/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: reqId,
        manager,
        updates: { note: value },
      }),
    });

    setTimeout(() => setTyping(false), 500);
  }

  async function approve(req: any) {
    await fetch("/api/requests/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: req.id,
        manager,
        updates: {
          status: "Approved",
          answered_by: manager,
          note,
        },
      }),
    });
    setExpanded(null);
  }

  async function deny(req: any) {
    await fetch("/api/requests/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: req.id,
        manager,
        updates: {
          status: "Denied",
          answered_by: manager,
          note,
        },
      }),
    });
    setExpanded(null);
  }

  return (
    <div className="max-w-[1100px] mx-auto pt-10 pb-8">

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Request Approvals
      </h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-4">
        {["All", "Viewed", "In Progress", "Approved", "Denied"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-white border text-emerald-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SEARCH */}
<input
  placeholder="Search employee..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    w-full max-w-[420px]
    px-4 py-2 mb-6
    rounded-md
    bg-white
    border border-emerald-300
    text-emerald-700
    placeholder:text-emerald-400

    outline-none
    focus:outline-none
    focus:ring-2 focus:ring-emerald-500
    focus:border-emerald-500

    shadow-sm
  "
/>

      {/* HEADERS */}
<div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-6 px-6 mb-3 text-sm font-semibold text-emerald-700">
  <div>Employee</div>
  <div>Type</div>
  <div className="text-center">Submitted</div>
  <div className="text-center">End Date</div>
  <div className="text-center">Status</div>
  <div className="text-right">Action</div>
</div>

      {/* ROWS */}
      {filtered.map((req) => {
        const isMine = req.claimed_by === manager;
        const isOpen = expanded === req.id;

        const activeViewers = presence.filter(
          (p) =>
            p.request_id === req.id &&
            Date.now() - new Date(p.last_active).getTime() < 10000
        );

        return (
          <motion.div key={req.id} className="bg-white rounded-xl shadow mb-3">

            {/* ROW */}
<div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-6 px-6 py-3 items-center"
              onClick={() => setExpanded(isOpen ? null : req.id)}
            >
{/* EMPLOYEE */}
<div className="font-medium text-emerald-700">
  {req.employee_name || "Unknown"}
</div>

{/* TYPE */}
<div className="text-emerald-600">
  {req.type}
</div>

{/* SUBMITTED */}
<div className="text-center text-emerald-600 whitespace-nowrap">
  {new Date(req.created_at).toLocaleDateString()}
</div>

{/* END DATE */}
<div className="text-center text-emerald-600 whitespace-nowrap">
  {req.end_date
    ? new Date(req.end_date).toLocaleDateString()
    : "—"}
</div>

              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <div className="text-right">
                {!req.claimed_by && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      claim(req);
                    }}
                    className="bg-emerald-600 text-white px-3 py-1 text-xs rounded"
                  >
                    Claim
                  </button>
                )}

                {req.claimed_by && (
                  <span className="text-xs text-blue-600">
                    {req.claimed_by}
                  </span>
                )}
              </div>
            </div>

            {/* EXPANDED */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4 border-t"
                >
                  {/* REASON */}
                  <div className="mt-3 text-sm text-gray-700">
                    {req.reason}
                  </div>

                  {/* PRESENCE */}
                  <div className="text-xs text-gray-500 mt-2">
                    {activeViewers.map((p) => (
                      <div key={p.id}>
                        {p.manager}
                        {p.typing && " typing..."}
                      </div>
                    ))}
                  </div>

                  {/* NOTES */}
                  <textarea
                    value={note}
                    disabled={!isMine}
                    onChange={(e) =>
                      isMine && updateNote(req.id, e.target.value)
                    }
                    placeholder={
                      isMine
                        ? "Add notes..."
                        : "Claim to edit notes"
                    }
                    className="w-full mt-3 border rounded-md p-2"
                  />

                  {/* ACTIONS */}
                  {isMine && (
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => deny(req)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Deny
                      </button>

                      <button
                        onClick={() => approve(req)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}