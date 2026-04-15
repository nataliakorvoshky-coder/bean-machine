"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Importing useRouter for navigation
import StyledDropdown from "@/components/StyledDropdown";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";



const API = "/api/employees";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter hook for navigation
  const id = params.id as string;
  console.log("PARAMS:", useParams())

  const CACHE_KEY = `employee-${id}`;

const [employee, setEmployee] = useState<any>(null);
const [status, setStatus] = useState<string>("");
const [strikeReason, setStrikeReason] = useState<string>("");

const [strikeHistory, setStrikeHistory] = useState<any[]>([]);
const [terminationHistory, setTerminationHistory] = useState<any[]>([]);

const [showTerminateModal, setShowTerminateModal] = useState<boolean>(false);
const [terminationReason, setTerminationReason] = useState<string>("");
const [rehireStatus, setRehireStatus] = useState<boolean | null>(null);
const [isTerminating, setIsTerminating] = useState<boolean>(false);

const [loaded, setLoaded] = useState(false);


  useEffect(() => {
  if (!id) return;

  loadEmployee();

  // 🌍 Auto-detect timezone
const detectedTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

fetch(`/api/employees/${id}/timezone`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ timezone: detectedTZ }),
});

const empChannel = supabase
  .channel(`employee-${id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "employees",
      filter: `id=eq.${id}`,
    },
() => {
  loadEmployee(); // ✅ ALWAYS FETCH FULL DATA
}
  )
  .subscribe();


// 🔥 ADD THIS BLOCK RIGHT HERE 👇
const hoursChannel = supabase
  .channel(`hours-${id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "work_hours",
      filter: `employee_id=eq.${id}`,
    },
    () => {
      loadEmployee(); // 🔥 force refresh when hours change
    }
  )
  .subscribe();

  /* ============================== */
  /* 🔥 STRIKE REALTIME (FIXED)     */
  /* ============================== */
     const strikeChannel = supabase
      .channel(`strikes-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employee_strikes",
          filter: `employee_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setStrikeHistory((prev) => {
              const updated = [payload.new, ...prev];

              setEmployee((prevEmp: any) => {
                const updatedEmp = {
                  ...prevEmp,
                  strikes: updated.length,
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(updatedEmp));
                return updatedEmp;
              });

              return updated;
            });
          }

          if (payload.eventType === "DELETE") {
            setStrikeHistory((prev) => {
              const updated = prev.filter((s) => s.id !== payload.old.id);

              setEmployee((prevEmp: any) => {
                const updatedEmp = {
                  ...prevEmp,
                  strikes: updated.length,
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(updatedEmp));
                return updatedEmp;
              });

              return updated;
            });
          }
        }
      )
      .subscribe();

  /* ============================== */
  /* 🔥 TERMINATION REALTIME        */
  /* ============================== */
 const termChannel = supabase
      .channel(`termination-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "termination_history",
          filter: `employee_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTerminationHistory((prev) => {
              const updated = [payload.new, ...prev];

              setEmployee((emp: any) => {
                const updatedEmp = {
                  ...emp,
                  termination_history: updated,
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(updatedEmp));
                return updatedEmp;
              });

              return updated;
            });
          }
        }
      )
      .subscribe();

  /* ============================== */
  /* CLEANUP                        */
  /* ============================== */
  return () => {
    supabase.removeChannel(empChannel);
    supabase.removeChannel(strikeChannel);
    supabase.removeChannel(termChannel);
    supabase.removeChannel(hoursChannel);
  };

}, [id]);

  async function loadEmployee() {
    try {
      console.log("FETCH URL:", `${API}/${id}`);

      const res = await fetch(`${API}/${id}`);
      const data = await res.json();

      if (data) {
        setEmployee(data);
        setStatus(data.status);
        setStrikeHistory(data.strike_history ?? []);
        setTerminationHistory(data.termination_history ?? []);

        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        setLoaded(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(newStatus: string) {
    const res = await fetch(`${API}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus(newStatus);
      setEmployee((prev: any) => ({
        ...prev,
        status: newStatus,
      }));
    }
  }

  // Rank Badge Color Helper
  function rankBadgeColor(rank: string) {
    if (rank === "Coffee Panda") {
      return "rank-coffee-panda"; // Custom rank color with opacity
    }

    const rankColors: { [key: string]: string } = {
      Bean: "rank-bean",
      Coffee: "rank-coffee",
      Latte: "rank-latte",
      Mocha: "rank-mocha",
      "Iced Coffee": "rank-iced-coffee",
      Cappuccino: "rank-cappuccino",
      Macchiato: "rank-macchiato",
      Frappuccino: "rank-frappuccino",
      Croissant: "rank-croissant",
    };

    return rankColors[rank] || "rank-bean"; // Default rank color if no match
  }

  const addStrike = async () => {
    if (!strikeReason) return;

    const res = await fetch(`${API}/${id}/strikes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: strikeReason }),
    });

    const data = await res.json();

    if (data.success) {
      setStrikeReason("");
      setEmployee((prev: any) => ({
        ...prev,
        strikes: data.strikes,
      }));
    }
  };

  const deleteStrike = async (strikeId: string) => {
    const res = await fetch(`${API}/${id}/strikes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strike_id: strikeId }),
    });

    const data = await res.json();

    if (data.success) {
      setEmployee((prev: any) => ({
        ...prev,
        strikes: data.strikes,
      }));
    }
  };

  // Handle promotion
  const handlePromotion = async () => {
    const res = await fetch(`/api/employees/${id}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.success) {
      const updatedRank = data.rank;
      setEmployee((prev: any) => ({
        ...prev,
        rank: updatedRank,
      }));
    } else {
      console.error("Promotion failed:", data.message);
    }
  };

  // Handle demotion
  const handleDemotion = async () => {
    const res = await fetch(`/api/employees/${id}/demote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.success) {
      const updatedRank = data.rank;
      setEmployee((prev: any) => ({
        ...prev,
        rank: updatedRank,
      }));
    } else {
      console.error("Demotion failed:", data.message);
    }
  };

  // Handle termination
const handleTermination = async () => {
  try {

          document.body.style.pointerEvents = "none";

    const res = await fetch(`/api/employees/${employee.id}/terminate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        termination_date: new Date().toISOString(),
        reason: terminationReason,
        rehire_status: rehireStatus ? "Eligible" : "Ineligible",
      }),
    });

    const data = await res.json();

    if (rehireStatus === null) {
  alert("Please select rehire eligibility");
  return;
}

    if (!res.ok) {
      console.error(data.error);
      return;
    }

    // 🔥 animation + modal close
    setIsTerminating(true);
    setShowTerminateModal(false);

    setTimeout(() => {
      router.push("/past-employees");
    }, 650);

  } catch (err) {
    console.error("Termination failed:", err);
  }
};

const isAdmin = employee?.rank === "Coffee Panda";
const isLoading = false;

if (!employee) {
  return (
    <div className="text-center text-emerald-600 mt-20">
      Loading employee...
    </div>
  );
}



const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut", // ✅ now typed correctly
    },
  },
};

// 🔥 MASTER STAGGER (REAL FIX FOR CASCADE)
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
};

return (
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  className={`max-w-[1050px] mx-auto py-8 ${
    isTerminating ? "opacity-0 translate-y-4 scale-95" : ""
  }`}
>
    <h1 className="text-3xl font-bold text-emerald-700 mb-6">
      Employee Profile
    </h1>

    {/* 🔥 MASTER STAGGER WRAPPER */}
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate={loaded ? "show" : "hidden"}
  className="flex flex-col gap-6"
>

      {/* HEADER */}
<motion.div variants={panelVariants}>
  <div className="flex justify-between items-start">
    <div>
      <div className="text-xl font-bold text-emerald-700">
        {employee?.name}
      </div>

      <div className="flex items-center gap-3 mt-1">
        <span className={`rank-badge ${rankBadgeColor(employee?.rank || "")}`}>
          {employee?.rank}
        </span>

        {strikeHistory.length > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-2 py-[2px] rounded-full bg-red-100 text-red-600 text-xs font-semibold"
          >
            ⚠ {strikeHistory.length} Strike
          </motion.span>
        )}
      </div>
    </div>

    <div className="w-[160px]">
      <StyledDropdown
              value={status}
              onChange={updateStatus}
              options={[
                { id: "Active", name: "Active" },
                { id: "ROA", name: "ROA" },
                { id: "LOA", name: "LOA" },
              ]} placeholder={""}      />
    </div>
  </div>
</motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* EMPLOYMENT */}
  <motion.div variants={panelVariants} className="bg-white rounded-xl shadow p-5">
  <h2 className="text-lg font-bold text-emerald-700 mb-4">Employment</h2>

  <div className="space-y-4 text-sm">

    {/* HIRE DATE */}
    <div className="flex justify-between">
      <span className="font-semibold text-emerald-700">Hire Date</span>
      <span className="text-emerald-600 font-semibold">
        {isAdmin
          ? "∞"
          : employee?.hire_date
          ? new Date(employee.hire_date).toLocaleDateString()
          : "N/A"}
      </span>
    </div>

    {/* LAST PROMOTION */}
    <div className="flex justify-between">
      <span className="font-semibold text-emerald-700">Last Promotion</span>
      <span className="text-emerald-600 font-semibold">
        {isAdmin
          ? "∞"
          : employee?.last_promotion_date
          ? new Date(employee.last_promotion_date).toLocaleDateString()
          : "N/A"}
      </span>
    </div>

    {/* LAST TERMINATION (HIDDEN FOR ADMIN) */}
    {!isAdmin && (
      <div className="flex justify-between">
        <span className="font-semibold text-emerald-700">Last Termination</span>
        <span className="text-red-500 font-semibold">
          {terminationHistory?.[0]?.termination_date
            ? new Date(terminationHistory[0].termination_date).toLocaleDateString()
            : "N/A"}
        </span>
      </div>
    )}

  </div>
</motion.div>

        {/* CONTACT */}
        <motion.div variants={panelVariants} className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-emerald-700 mb-4">Contact</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-700">Phone</span>
              <span className="text-emerald-600">{employee?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-700">CID</span>
              <span className="text-emerald-600">{employee?.cid}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-700">IBAN</span>
              <span className="text-emerald-600">{employee?.iban}</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* HOURS */}
      <motion.div variants={panelVariants} className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-emerald-700 mb-4">
          Hours & Earnings
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
{
  label: "Weekly Hours",
  value: `${employee?.weekly_hours ?? 0}h ${employee?.weekly_minutes ?? 0}m`,
},
{
  label: "Lifetime Hours",
  value: `${employee?.lifetime_hours ?? 0}h ${employee?.lifetime_minutes ?? 0}m`,
},
            { label: "Weekly Earnings", value: `$${employee?.weekly_earnings ?? 0}` },
            { label: "Lifetime Earnings", value: `$${employee?.lifetime_earnings ?? 0}` },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="font-semibold text-emerald-700">{item.label}</div>
              <div className="text-emerald-600 font-semibold">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* STRIKES */}
      {employee?.rank !== "Coffee Panda" && (
        <motion.div variants={panelVariants} className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-red-600 mb-4">Strike History</h2>

          <div className="flex gap-4 items-center mb-4">
            <div className="w-[70px] border border-red-300 rounded px-3 py-2 text-center text-red-600">
              {strikeHistory.length + 1}
            </div>

            <input
              value={strikeReason}
              onChange={(e) => setStrikeReason(e.target.value)}
              className="flex-1 border border-red-300 rounded px-3 py-2 text-sm text-red-600 focus:ring-2 focus:ring-red-500"
            />

            <button className="bg-red-600 text-white px-4 py-2 rounded text-sm">
              Add
            </button>
          </div>

          <AnimatePresence>
            {strikeHistory.map((strike: any, index) => (
              <motion.div
                key={strike.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="flex justify-between items-center rounded-lg px-3 py-2 text-sm mb-2 border bg-red-50 border-red-200"
              >
                <div className="flex gap-4 items-center">
                  <div className="text-red-500 font-semibold">#{strike.number ?? index + 1}</div>
                  <div className="text-red-700 font-medium">{strike.reason}</div>
                  <div className="text-xs text-red-500">
                    {new Date(strike.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button className="text-red-500 text-xs">Delete</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* TERMINATION */}
      {terminationHistory.length > 0 && (
        <motion.div variants={panelVariants} className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-red-500 mb-4">
            Termination History
          </h2>

          {terminationHistory.map((t: any, index: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="py-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-red-500">
                  {new Date(t.termination_date).toLocaleDateString()}
                </span>
                <span className="text-sm font-semibold text-red-500">
                  Terminated
                </span>
              </div>

              <div className="text-sm">
                <span className="font-semibold text-emerald-700">Reason:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {t.reason || "N/A"}
                </span>
              </div>

              {index !== terminationHistory.length - 1 && (
                <div className="border-t border-dashed border-gray-300 mt-4"></div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

    </motion.div>

    {/* 🔥 ACTION BUTTONS */}
{!isAdmin && (
  <motion.div
    variants={panelVariants}
    className="flex gap-4 mt-8"
  >
    <button
      onClick={handlePromotion}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Promote
    </button>

    <button
      onClick={handleDemotion}
      className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition"
    >
      Demote
    </button>

    <button
      onClick={() => setShowTerminateModal(true)}
      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
    >
      Terminate
    </button>
  </motion.div>
)}

{showTerminateModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl p-6 w-[420px] shadow-xl"
    >
      <h2 className="text-lg font-bold text-red-600 mb-4">
        Confirm Termination
      </h2>

      {/* 🔥 REASON LABEL */}
      <label className="text-sm font-semibold text-red-500 mb-1 block">
        Termination Reason
      </label>

      {/* 🔥 INPUT */}
      <input
        value={terminationReason}
        onChange={(e) => setTerminationReason(e.target.value)}
        placeholder="Enter reason for termination..."
        className="w-full border border-red-300 rounded px-3 py-2 text-sm text-red-700 
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 
        transition mb-4"
      />

      {/* 🔥 REHIRE TOGGLE */}
      <div className="mb-5">
        <span className="text-sm font-semibold text-emerald-700 block mb-2">
          Rehire Eligibility
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => setRehireStatus(true)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              rehireStatus
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Eligible
          </button>

          <button
            onClick={() => setRehireStatus(false)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              !rehireStatus
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Ineligible
          </button>
        </div>
      </div>

      {/* 🔥 ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowTerminateModal(false)}
          className="text-gray-600 hover:text-black transition"
        >
          Cancel
        </button>

        <button
          onClick={handleTermination}
          className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  </div>
)}
  </motion.div>
);
}