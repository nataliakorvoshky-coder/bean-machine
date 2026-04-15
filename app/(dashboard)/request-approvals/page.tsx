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
  const [showAllActivity, setShowAllActivity] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState(0);
const PAGE_SIZE = 10;




  /* ========================= */
  /* 🔥 LOAD DATA              */
  /* ========================= */
  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
  setPage(0);
}, [search, filter]);

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
      if (!payload?.new) return;

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== payload.new.id) return r;

          return {
            ...r,
            ...payload.new,
            notes_history:
              payload.new.notes_history ?? r.notes_history,
          };
        })
      );

if (expanded === payload.new.id && !typing) {
  // ❌ DO NOT OVERRIDE LOCAL INPUT AFTER SUBMIT
  if (!payload.new.note) {
    setNote("");
  }
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

       fetch("/api/requests/presence", {
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

const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

const paginated = filtered.slice(
  page * PAGE_SIZE,
  page * PAGE_SIZE + PAGE_SIZE
);

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
    case "Pending":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /* ========================= */
  /* 🔐 ACTIONS                */
  /* ========================= */
async function claim(req: any) {

  // ✅ 1. INSTANT UI UPDATE (FIXES YOUR ISSUE)
  setRequests((prev) =>
    prev.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: "In Progress",
            claimed_by: manager,
            claimed_at: new Date().toISOString(),
          }
        : r
    )
  );

  // ✅ 2. BACKEND UPDATE
  fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
      updates: {
        status: "In Progress",
        claimed_by: manager,
        claimed_at: new Date().toISOString(),
      },
    }),
  });
}

async function updateNote(req: any, value: string) {
  setNote(value);
  setTyping(true);

  // 🔥 PREVENT SPAM (debounce)
  clearTimeout((window as any)._noteTimer);

  (window as any)._noteTimer = setTimeout(() => {
    setTyping(false);
  }, 600);

  fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
      updates: {
        note: value,

        // ✅ THIS IS WHAT YOU WERE MISSING
        notes_history: [
          ...(req.notes_history || []),
          {
            text: value,
            by: manager,
            at: new Date().toISOString(),
            type: "Note",
          },
        ],
      },
    }),
  });
}

async function approve(req: any) {

  // ✅ INSTANT UI UPDATE
  setRequests((prev) =>
    prev.map((r) =>
      r.id === req.id
        ? {
...r,
status: "Approved",
answered_by: manager,
note,

// 🔥 APPLY UPDATE
start_date: req.pending_update?.start_date || r.start_date,
end_date: req.pending_update?.end_date || r.end_date,

pending_update: null,

notes_history: [
  ...(req.notes_history || []),
  {
    text: note,
    by: manager,
    at: new Date().toISOString(),
    type: "Approved", // or "Denied"
  },
],
          }
        : r
    )
  );

  // ✅ BACKEND UPDATE
  fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
updates: {
  status: "Approved",
  answered_by: manager,
  answered_at: new Date().toISOString(),
  note,

  // 🔥 APPLY PENDING UPDATE TO DATABASE
  ...(req.pending_update?.start_date && {
    start_date: req.pending_update.start_date,
  }),

  ...(req.pending_update?.end_date && {
    end_date: req.pending_update.end_date,
  }),

  // 🔥 CLEAR IT AFTER APPLYING
  pending_update: null,

  // 🔥 ADD TO HISTORY
  notes_history: [
    ...(req.notes_history || []),
    {
      text: note,
      by: manager,
      at: new Date().toISOString(),
      type: "Approved",
    },
  ],
},
    }),
  });

  setExpanded(null);
setNote(""); // ✅ CLEAR NOTE
}

async function deny(req: any) {

  // ✅ 1. INSTANT UI UPDATE (THIS IS WHAT YOU ARE MISSING)
  setRequests((prev) =>
    prev.map((r) =>
      r.id === req.id
        ? {
            ...r,
status: "Denied",
answered_by: manager,
note,
notes_history: [
  ...(req.notes_history || []),
  {
    text: note,
    by: manager,
    at: new Date().toISOString(),
    type: "Denied",
  },
],
          }
        : r
    )
  );

  // ✅ 2. BACKEND UPDATE
  fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
updates: {
  status: "Denied",
  answered_by: manager,
  answered_at: new Date().toISOString(),
  note,

  // 🔥 CLEAR PENDING (DO NOT APPLY)
  pending_update: null,

  notes_history: [
    ...(req.notes_history || []),
    {
      text: note,
      by: manager,
      at: new Date().toISOString(),
      type: "Denied",
    },
  ],
},
    }),
  });

  setExpanded(null);
setNote(""); // ✅ CLEAR NOTE
}

async function approveUpdate(req: any, entry: any) {

  setRequests((prev) =>
    prev.map((r) => {
      if (r.id !== req.id) return r;

      const updatedHistory = (r.notes_history || []).map((n: any) => {
        if (n.at === entry.at) {
          return {
            ...n,
            type: "Approved", // ✅ ONLY THIS ENTRY
          };
        }
        return n;
      });

      return {
        ...r,

        // ✅ APPLY DATE CHANGE
        start_date: entry.start_date || r.start_date,
        end_date: entry.end_date || r.end_date,

        // ✅ UPDATE HISTORY ONLY
        notes_history: updatedHistory,
        
      };
    })
  );

  await fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
      updates: {
        notes_history: (req.notes_history || []).map((n: any) =>
          n.at === entry.at ? { ...n, type: "Approved" } : n
        ),

        ...(entry.start_date && { start_date: entry.start_date }),
        ...(entry.end_date && { end_date: entry.end_date }),
      },
    }),
  });
  setNote(""); // ✅ CLEAR NOTE AFTER APPROVE UPDATE
}

async function denyUpdate(req: any, entry: any) {

  setRequests((prev) =>
    prev.map((r) => {
      if (r.id !== req.id) return r;

      const updatedHistory = (r.notes_history || []).map((n: any) => {
        if (n.at === entry.at) {
          return {
            ...n,
            type: "Denied",
          };
        }
        return n;
      });

      return {
        ...r,
        notes_history: updatedHistory,
      };
    })
  );

  await fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
      updates: {
        notes_history: (req.notes_history || []).map((n: any) =>
          n.at === entry.at ? { ...n, type: "Denied" } : n
        ),
      },
    }),
  });
  setNote(""); // ✅ CLEAR NOTE AFTER APPROVE UPDATE
}

async function addNote(req: any) {
  if (!note?.trim()) return;

  // ✅ INSTANT UI UPDATE
  setRequests((prev) =>
    prev.map((r) =>
      r.id === req.id
        ? {
            ...r,
            note,
            notes_history: [
              ...(req.notes_history || []),
              {
                text: note,
                by: manager,
                at: new Date().toISOString(),
                type: "Note",
              },
            ],
          }
        : r
    )
  );

  // ✅ BACKEND UPDATE
  fetch("/api/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: req.id,
      manager,
      updates: {
        note,
        notes_history: [
          {
            text: note,
            by: manager,
            at: new Date().toISOString(),
            type: "Note",
          },
        ],
      },
    }),
  });

  // ✅ CLEAR INPUT
  setTimeout(() => {
  setNote("");
}, 0);
}

const unreadCount = requests.filter(r => r.status === "Pending").length;

  return (
    <div className="max-w-[1100px] mx-auto pt-10 pb-8">

<div className="flex items-center gap-3 mb-6">
  <h1 className="text-3xl font-bold text-emerald-700">
    Request Approvals
  </h1>

  {unreadCount > 0 && (
    <span className="bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
      {unreadCount} New
    </span>
  )}
</div>

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
<motion.div
  key={page}
  initial={{ x: 80, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
{paginated.map((req) => {

        const isMine = req.claimed_by === manager;
        const isOpen = expanded === req.id;
const hasPendingUpdate = (req.notes_history || []).some((n: any) => {
  const isUpdate = n.start_date || n.end_date;

  const isResolved =
    n.type === "Approved" || n.type === "Denied";

  return isUpdate && !isResolved;
});

        const activeViewers = presence.filter(
          (p) =>
            p.request_id === req.id &&
            Date.now() - new Date(p.last_active).getTime() < 10000
        );

        return (
          <motion.div
  key={req.id}
  className={`
    bg-white rounded-xl mb-3
   ${req.status === "Pending" || hasPendingUpdate
      ? "border border-emerald-300 shadow-lg"
      : "shadow"}
  `}
  animate={
    req.status === "Pending" || hasPendingUpdate
      ? {
          boxShadow: [
            "0 0 0px rgba(16,185,129,0)",
            "0 0 12px rgba(16,185,129,0.5)",
            "0 0 0px rgba(16,185,129,0)",
          ],
        }
      : {}
  }
  transition={{
    duration: 2,
    repeat: Infinity,
  }}
>

            {/* ROW */}
<div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-6 px-6 py-3 items-center"
onClick={async () => {
  const opening = !isOpen;
  setExpanded(opening ? req.id : null);

  if (opening && req.status === "Pending") {

    // ✅ 1. INSTANT UI UPDATE (FIXES YOUR ISSUE)
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? { ...r, status: "Viewed" }
          : r
      )
    );

    // ✅ 2. BACKEND UPDATE (realtime syncs others)
     fetch("/api/requests/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: req.id,
        manager,
        updates: {
          status: "Viewed",
          viewed_at: new Date().toISOString(),
        },
      }),
    });
  }
}}
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
<div className="flex items-center gap-2 justify-center">

  {/* ✅ NEW BADGE */}
{hasPendingUpdate && !isOpen && (
  <motion.span
    initial={{ opacity: 1, scale: 1 }}
    animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.8 : 1 }}
    transition={{ duration: 0.25 }}
    className="text-[10px] px-2 py-[2px] rounded-full bg-emerald-500 text-white font-semibold"
  >
    {hasPendingUpdate ? "UPDATE" : "NEW"}
  </motion.span>
)}

  {/* STATUS */}
  <span
    className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(req.status)}`}
  >
    {req.status}
  </span>
</div>
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
                  className="px-6 pb-4 border-t border-emerald-200"
                >
                  {/* REASON */}
<div className="mt-4">
  <div className="text-xs font-semibold text-emerald-600 mb-1">
    Reason
  </div>

  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
    {req.reason || "No reason provided"}
  </div>
</div>

{/* 📅 ORIGINAL DATES */}
<div className="mt-3">
  <div className="text-[11px] font-semibold text-emerald-700 tracking-wide">
    ORIGINAL DATES
  </div>

  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
    {req.start_date
      ? new Date(req.start_date).toLocaleDateString()
      : "—"}{" "}
    →{" "}
    {req.end_date
      ? new Date(req.end_date).toLocaleDateString()
      : "—"}
  </div>
</div>

                  {/* PRESENCE */}
                  <div className="text-xs text-emerald-500 mt-2">
                    {activeViewers.map((p) => (
                      <div key={p.id}>
                        {p.manager}
                        {p.typing && " typing..."}
                      </div>
                    ))}
                  </div>

                  {/* NOTES */}
{/* 🧾 TIMELINE */}
{req.notes_history?.length > 0 && (
  <div className="mt-4 space-y-3">

    <div className="text-[11px] font-semibold text-emerald-700 tracking-wide">
      ACTIVITY
    </div>

    <div className="relative pl-4 border-l-2 border-emerald-200 space-y-3">

      {(showAllActivity[req.id]
  ? req.notes_history
  : [req.notes_history[req.notes_history.length - 1]]
).map((entry: any, i: number) => (

  
        <div key={i} className="relative">

          <div className="absolute -left-[7px] top-2 w-3 h-3 bg-emerald-500 rounded-full"></div>

          <div className="bg-emerald-50 border border-emerald-300 rounded-md px-3 py-2">

<div className="text-sm text-emerald-800 space-y-1">

  <div>{entry.text}</div>

  {/* 🔥 SHOW UPDATE DATES */}
{(entry.start_date || entry.end_date) && (
  <div className="text-[11px] text-blue-600 space-y-1">

    {/* 🔥 START DATE CHANGE */}
    {entry.start_date && (
      <div>
        Start:{" "}
        <span className="line-through text-gray-400">
          {req.start_date
            ? new Date(req.start_date).toLocaleDateString()
            : "—"}
        </span>{" "}
        →{" "}
        <span className="text-emerald-600 font-semibold">
          {new Date(entry.start_date).toLocaleDateString()}
        </span>
      </div>
    )}

    {/* 🔥 END DATE CHANGE */}
    {entry.end_date && (
      <div>
        End:{" "}
        <span className="line-through text-gray-400">
          {req.end_date
            ? new Date(req.end_date).toLocaleDateString()
            : "—"}
        </span>{" "}
        →{" "}
        <span className="text-emerald-600 font-semibold">
          {new Date(entry.end_date).toLocaleDateString()}
        </span>
      </div>
    )}

  </div>
)}

{i === 0 && req.notes_history?.length > 1 && (
  <button
    onClick={() =>
      setShowAllActivity((prev) => ({
        ...prev,
        [req.id]: !prev[req.id],
      }))
    }
    className="text-xs text-blue-600 mt-2"
  >
    {showAllActivity[req.id] ? "Show less" : "Show all activity"}
  </button>
)}

  {/* 🔥 PER-UPDATE ACTIONS */}
{(entry.start_date || entry.end_date) &&
 req.status !== "Pending" && // 🔥 ONLY AFTER INITIAL DECISION
 entry.type !== "Approved" &&
 entry.type !== "Denied" && (
  <div className="flex justify-end gap-2 mt-2">

    <button
      onClick={() => approveUpdate(req, entry)}
      className="bg-emerald-600 text-white px-2 py-1 text-xs rounded"
    >
      Approve Update
    </button>

    <button
      onClick={() => denyUpdate(req, entry)}
      className="bg-red-500 text-white px-2 py-1 text-xs rounded"
    >
      Deny Update
    </button>

  </div>
)}

</div>

            <div className="flex justify-between text-xs text-emerald-600 mt-1">
              <span>{entry.by}</span>
              <span>{new Date(entry.at).toLocaleString()}</span>
            </div>

<div
  className={`mt-1 text-[10px] font-semibold
    ${
      entry.type === "Approved"
        ? "text-emerald-600"
        : entry.type === "Denied"
        ? "text-red-500"
        : "text-blue-500"
    }
  `}
>
  {entry.type}
</div>

          </div>
        </div>
      ))}

    </div>
  </div>
)}

{/* ✍️ EDIT BOX */}
{(
  req.status === "In Progress" ||
  req.status === "Approved" ||
  req.status === "Denied"
) && (
<textarea
  value={note}
    disabled={!isMine}
onChange={(e) => {
  if (!isMine) return;
  setNote(e.target.value);
}}
    placeholder={
      isMine ? "Add update..." : "Claim to edit"
    }
className="
  w-full mt-4 p-3 rounded-md
  bg-white
  text-emerald-700
  placeholder:text-emerald-400

  border border-emerald-300
  outline-none

  focus:outline-none
  focus:ring-2 focus:ring-emerald-500
  focus:border-emerald-500

  transition-all
"
  />
)}

{/* ACTIONS */}
{isMine && (
  <div className="flex justify-end gap-2 mt-3">

    {/* 🔥 SHOW ONLY BEFORE FIRST DECISION */}
    {req.status !== "Approved" && req.status !== "Denied" && (
      <>
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
      </>
    )}

    {/* ALWAYS AVAILABLE */}
    <button
      onClick={() => addNote(req)}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Add Note
    </button>

  </div>
)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
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
    Page {page + 1} / {totalPages}
  </span>

  <button
    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
    disabled={page >= totalPages - 1}
    className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 disabled:opacity-40"
  >
    Next
  </button>

</div>
    </div>
  );
}