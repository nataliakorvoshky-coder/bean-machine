"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StyledDropdown from "@/components/StyledDropdown";
import { supabase } from "@/lib/supabase";
import GlobalSync from "@/components/GlobalSync";
import { motion, AnimatePresence } from "framer-motion";
import { initRealtime } from "@/lib/realtime";


const API = "/api/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [loaded, setLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const [page, setPage] = useState(0);
const PAGE_SIZE = 10;

  /* ============================== */
  /* ✅ INITIAL LOAD                */
  /* ============================== */
useEffect(() => {
  fetchEmployees();
  fetchAnalytics();
}, []);

async function fetchAnalytics() {

  try {

    const res = await fetch(
      "/api/employee-analytics",
      { cache: "no-store" }
    );

    const data = await res.json();

    setAnalytics(data);

  } catch (err) {

    console.error(err);

  }

}

  useEffect(() => {
  setPage(0);
}, [search, filter]);

useEffect(() => {
  const cleanup = initRealtime({
onEmployeeUpdate: () => {
  fetchEmployees(); // 🔥 ALWAYS REFRESH
},

onWorkHoursUpdate: () => {
  fetchEmployees(); // 🔥 THIS FIXES HOURS NOT UPDATING
},

    onStrikeUpdate: (payload) => {
      const updated = payload.new;
      if (!updated) return;

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === updated.employee_id
            ? { ...emp, strikes: (emp.strikes ?? 0) + 1 }
            : emp
        )
      );
    },
  });

  return cleanup;
}, []);

async function fetchEmployees() {
const res = await fetch(API, { cache: "no-store" }); 
  const data = await res.json();

  

const formatted = (Array.isArray(data) ? data : []).map((e: any) => ({
  ...e,

  // ✅ USE API VALUES (ALREADY CALCULATED)
  hours: e.hours ?? 0,
  minutes: e.minutes ?? 0,
  earnings: e.earnings ?? 0,

  goal_met: e.goal_met ?? false,
}));

setEmployees(formatted);

}
  /* ============================== */
  /* 🔍 FILTERING                   */
  /* ============================== */
  const filterEmployees = (employee: any) => {
    if (!filter || filter === "No Filter") return true;

    if (filter.includes("Goal Met") && !employee.goal_met) return false;
    if (filter.includes("Goal Not Met") && employee.goal_met) return false;

    return true;
  };

  const filteredEmployees = employees
    .filter((emp) => emp.status !== "Terminated")
    .filter((emp) => {
      if (!search) return true;
      return emp.name.toLowerCase().includes(search.toLowerCase());
    })
    .filter(filterEmployees)
    .sort((a, b) => {
      if (a.rank === "Coffee Panda") return -1;
      if (b.rank === "Coffee Panda") return 1;
      return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

const paginatedEmployees = filteredEmployees.slice(
  page * PAGE_SIZE,
  page * PAGE_SIZE + PAGE_SIZE
);

  /* ============================== */
  /* 🧮 TOTAL HOURS FIX             */
  /* ============================== */
const totalMinutes = employees.reduce((acc, e) => {
  return acc + ((e.hours ?? 0) * 60 + (e.minutes ?? 0));
}, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  /* ============================== */
  /* 🎨 HELPERS                     */
  /* ============================== */
  function statusBadge(status: string) {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "ROA" || status === "LOA") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  }

  function rankBadgeColor(rank: string) {
    switch (rank) {
      case "Macchiato": return "bg-[var(--macchiato)] text-white";
      case "Cappuccino": return "bg-[var(--cappuccino)] text-white";
      case "Latte": return "bg-[var(--latte)] text-white";
      case "Mocha": return "bg-[var(--mocha)] text-white";
      case "Iced Coffee": return "bg-[var(--iced-coffee)] text-white";
      case "Frappuccino": return "bg-[var(--frappuccino)] text-white";
      case "Croissant": return "bg-[var(--croissant)] text-white";
      case "Coffee Panda": return "bg-[var(--coffee-panda)] text-white";
      case "Bean": return "bg-[var(--bean)] text-gray-700";
      case "Coffee": return "bg-[var(--coffee)] text-white";
      default: return "bg-gray-100 text-gray-600";
    }
  }

function rowBorder(emp: any) {

  const badges = employeeBadges(emp);

  // 🔥 ADMIN
if (emp.rank === "Coffee Panda") {

  return `
    border border-violet-300
    relative overflow-hidden
    admin-galaxy
  `;

}

  // 🔥 NO BADGES
  if (badges.length === 0) {

    if (emp.status === "Active") {
      return "border border-emerald-400";
    }

    if (
      emp.status === "ROA" ||
      emp.status === "LOA"
    ) {
      return "border border-yellow-400";
    }

    return "border border-gray-200";

  }

  // 🔥 SINGLE BADGE
  if (badges.length === 1) {

    const badge = badges[0].label;

    if (badge.includes("Lifetime")) {
      return `
        border border-yellow-300
        shadow-[0_0_10px_rgba(250,204,21,0.45)]
      `;
    }

    if (badge.includes("Weekly")) {
      return `
        border border-emerald-400
        shadow-[0_0_10px_rgba(16,185,129,0.45)]
      `;
    }

    if (badge.includes("Monthly")) {
      return `
        border border-cyan-400
        shadow-[0_0_10px_rgba(6,182,212,0.45)]
      `;
    }

    if (badge.includes("Yearly")) {
      return `
        border border-fuchsia-400
        shadow-[0_0_10px_rgba(217,70,239,0.45)]
      `;
    }

  }

  // 🔥 MULTI BADGE
  return `
    border border-transparent
    animate-rainbowBorder
  `;

}

function employeeBadges(emp: any) {

  if (!analytics) return [];

  const badges = [];

  // 🔥 SAFE NAMES
  const weeklyName =
    analytics.weekly?.[0]?.employee_name ||
    analytics.weekly?.[0]?.name;

  const monthlyName =
    analytics.monthly?.[0]?.employee_name ||
    analytics.monthly?.[0]?.name;

  const yearlyName =
    analytics.yearly?.[0]?.employee_name ||
    analytics.yearly?.[0]?.name;

  const lifetimeName =
    analytics.topEmployees?.[0]?.name ||
    analytics.topEmployees?.[0]?.employee_name;

  // 🔥 CHECKS
  const isWeekly =
    weeklyName === emp.name;

  const isMonthly =
    monthlyName === emp.name;

  const isYearly =
    yearlyName === emp.name;

  const isLifetime =
    lifetimeName === emp.name;

  // 🔥 LIFETIME
  if (isLifetime) {
    badges.push({
      label: "✨ Lifetime",
      className:
        "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-amber-900 border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
    });
  }

  // 🔥 WEEKLY
  if (isWeekly) {
    badges.push({
      label: "⚡ Weekly",
      className:
        "bg-gradient-to-r from-emerald-300 to-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.45)]"
    });
  }

  // 🔥 MONTHLY
  if (isMonthly) {
    badges.push({
      label: "🌊 Monthly",
      className:
        "bg-gradient-to-r from-sky-300 to-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.45)]"
    });
  }

  // 🔥 YEARLY
  if (isYearly) {
    badges.push({
      label: "👑 Yearly",
      className:
        "bg-gradient-to-r from-violet-300 to-fuchsia-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.45)]"
    });
  }

  return badges;

}

  async function handleWeeklyReset() {
  const confirmReset = confirm("Are you sure you want to reset ALL weekly stats?");

  if (!confirmReset) return;

  try {
    const res = await fetch("/api/cron/weekly-reset?force=true");

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Reset failed");
      return;
    }

    alert(`✅ Reset ${data.resetCount || 0} employees`);

    // 🔥 refresh UI
    fetchEmployees();

  } catch (err) {
    console.error("Reset error:", err);
    alert("Server error during reset");
  }
}


  
  /* ============================== */
  /* 🚀 UI                          */
  /* ============================== */
return (
  <div className="w-full px-10 py-8">
    <div className="flex justify-between items-center mb-8">

  <h1 className="text-4xl font-bold text-emerald-700">Employees</h1>

  <div className="flex items-center gap-3">

    {/* 🔥 MANUAL RESET BUTTON */}
    <button
      onClick={handleWeeklyReset}
      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
    >
      Reset Weekly Stats
    </button>

    <div className="bg-white shadow rounded-xl px-5 py-3 w-[200px] text-right">
      <div className="text-xs text-gray-500">Total Employee Hours</div>
      <div className="text-lg font-semibold text-emerald-700">
        {totalHours}h {remainingMinutes}m
      </div>
    </div>

  </div>
</div>
    
    {/* SEARCH + FILTER */}
    <div className="mb-8 flex gap-4 items-center">
      <input
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-[400px] text-sm px-4 py-2 border border-emerald-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="w-[220px]">
        <StyledDropdown
          value={filter}
          onChange={setFilter}
          placeholder="Filter"
          options={[
            { id: "No Filter", name: "No Filter" },
            { id: "Goal Met", name: "Goal Met" },
            { id: "Goal Not Met", name: "Goal Not Met" },
          ]}
        />
      </div>
    </div>

    {/* HEADER */}
    <div className="grid grid-cols-[3fr_2fr_1.3fr_2fr_1.2fr_1.2fr_1.2fr_1.2fr] text-sm font-semibold text-emerald-700 px-6 mb-3">
<div>Name</div>
<div>Badges</div>
<div>Status</div>
      <div>Rank</div>
      <div>Wage</div>
      <div>Hours</div>
      <div>Earnings</div>
      <div>Goal</div>
    </div>

    {/* ROWS */}
    <AnimatePresence mode="popLayout">
      <motion.div
        key={page}
        layout
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -80, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {paginatedEmployees.map((emp, index) => {
          const isAdmin = emp.rank === "Coffee Panda";

          return (
            <motion.div
              key={emp.id}
              layout="position"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                x: 80,
                scale: 0.95,
                transition: { duration: 0.25 },
              }}
              transition={{
                delay: index * 0.08,
                duration: 0.35,
                ease: "easeOut",
              }}
              className={`
  grid grid-cols-[3fr_2fr_1.3fr_2fr_1.2fr_1.2fr_1.2fr_1.2fr]
  items-center
  shadow rounded-xl px-6 py-3 mb-3
 ${
  isAdmin
    ? "bg-gradient-to-br from-violet-950/90 via-fuchsia-950/75 to-slate-950/90 backdrop-blur-sm"
    : "bg-white"
}
  ${rowBorder(emp)}
`}
            >

{isAdmin && (
  <>
    <div
      className="shooting-star"
      style={{
        top: "8%",
        left: "12%",
        animationDelay: "0s",
      }}
    />

    <div
      className="shooting-star"
      style={{
        top: "22%",
        left: "38%",
        animationDelay: "3s",
      }}
    />

    <div
      className="shooting-star"
      style={{
        top: "14%",
        left: "64%",
        animationDelay: "6s",
      }}
    />

    <div
      className="shooting-star"
      style={{
        top: "30%",
        left: "82%",
        animationDelay: "9s",
      }}
    />
  </>
)}

<Link
  href={`/employees/${emp.id}`}
  className="
    text-emerald-700 font-medium
    hover:bg-emerald-50
    px-2 py-[2px]
    rounded w-fit
  "
>
  {emp.name}
</Link>

<div
className="
    flex flex-col items-start
    h-[26px]
    overflow-y-auto
    overflow-x-hidden
    scrollbar-hide
    pr-1
"
>

  {employeeBadges(emp).map(
    (badge: any, i: number) => (

    <div
      key={i}
className={`
        inline-flex w-fit
        whitespace-nowrap
        px-2 py-[3px]
        rounded-full
        text-[10px]
        font-medium
        shadow-sm
        ${badge.className}
      `}
    >
      {badge.label}
    </div>

  ))}

</div>

              <span className={`inline-flex w-fit items-center px-3 py-[2px] rounded-full text-xs ${statusBadge(emp.status)}`}>
                {emp.status}
              </span>

<span
  className={`
    inline-flex w-fit items-center gap-2
    whitespace-nowrap
    px-3 py-[2px]
    rounded-full text-xs
    ${rankBadgeColor(emp.rank)}
  `}
>
  {isAdmin && (
    <span className="animate-pandaFloat">
      🐼
    </span>
  )}

  {emp.rank}
</span>

              <div className="text-emerald-700 font-medium text-sm">
                {isAdmin ? "∞" : `$${emp.wage}/hr`}
              </div>

              <div className="text-emerald-700 font-medium text-sm">
                {emp.minutes > 0
                  ? `${emp.hours}h ${emp.minutes}m`
                  : `${emp.hours}h`}
              </div>

              <div className="text-emerald-700 font-semibold text-sm">
                {isAdmin ? "∞" : `$${emp.earnings}`}
              </div>

<div
  className={
    isAdmin
      ? "text-purple-500 font-semibold text-sm"

      : emp.goal_exempt
      ? "text-sky-500 font-semibold"

      : emp.goal_met
      ? "text-emerald-600 font-medium"

      : "text-red-500 font-medium"
  }
>
  {isAdmin

    ? "Always"

    : emp.goal_exempt

    ? "Exempt"

    : emp.goal_met

    ? "Met"

    : "Not Met"}
</div>

            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>

    {/* PAGINATION */}
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