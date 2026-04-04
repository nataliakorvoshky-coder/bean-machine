"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StyledDropdown from "@/components/StyledDropdown";
import { supabase } from "@/lib/supabase";
import "../../globals.css";
import GlobalSync from "@/components/GlobalSync";
import { motion, AnimatePresence } from "framer-motion";


const API = "/api/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [loaded, setLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  /* ============================== */
  /* ✅ INITIAL LOAD                */
  /* ============================== */
  useEffect(() => {
    fetchEmployees();
  }, []);

async function fetchEmployees() {
  const res = await fetch(API);
  const data = await res.json();

  

  const formatted = (Array.isArray(data) ? data : []).map((e: any) => ({
    ...e,
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

  /* ============================== */
  /* 🧮 TOTAL HOURS FIX             */
  /* ============================== */
  const totalMinutes = employees.reduce((acc, e) => {
    return acc + (e.minutes ?? 0);
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

  function rowBorder(status: string, isAdmin: boolean) {
    if (isAdmin) {
      return "border-none shadow-[0px_0px_4px_2px_rgba(138,43,226,0.6)] hover:shadow-[0px_0px_8px_3px_rgba(138,43,226,0.8)]";
    }
    if (status === "Active") return "border border-emerald-400";
    if (status === "ROA" || status === "LOA") return "border border-yellow-400";
    return "border border-gray-200";
  }


  
  /* ============================== */
  /* 🚀 UI                          */
  /* ============================== */
  return (
    <div className="w-full px-10 py-8">

<GlobalSync
  onEmployeeUpdate={(payload) => {
    const updated = payload.new;

    if (!updated) return;

    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === updated.id);

      // 🔥 TERMINATED → REMOVE (triggers exit animation)
      if (updated.status === "Terminated") {
        return prev.filter((e) => e.id !== updated.id);
      }

      // 🔥 REHIRED → ADD BACK (smooth entry)
      if (updated.status === "Active" && !exists) {
        return [updated, ...prev];
      }

      // 🔥 NORMAL UPDATE → PATCH (no flicker)
      return prev.map((emp) =>
        emp.id === updated.id ? { ...emp, ...updated } : emp
      );
    });
  }}

  onStrikeUpdate={(payload) => {
    const updated = payload.new;
    if (!updated) return;

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === updated.employee_id
          ? { ...emp, strikes: (emp.strikes ?? 0) + 1 }
          : emp
      )
    );
  }}
/>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-700">Employees</h1>

        <div className="bg-white shadow rounded-xl px-5 py-3 w-[200px] text-right">
          <div className="text-xs text-gray-500">Total Employee Hours</div>
          <div className="text-lg font-semibold text-emerald-700">
            {totalHours}h {remainingMinutes}m
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
      <div className="grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] text-sm font-semibold text-emerald-700 px-6 mb-3">
        <div>Name</div>
        <div>Status</div>
        <div>Rank</div>
        <div>Wage</div>
        <div>Hours</div>
        <div>Earnings</div>
        <div>Goal</div>
      </div>

{/* ROWS */}
<motion.div layout>
  <AnimatePresence mode="popLayout">
{filteredEmployees.map((emp, index) => {
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
    transition: { duration: 0.25 }
  }}

  transition={{
    delay: index * 0.08,   // 🔥 REAL CASCADE
    duration: 0.35,
    ease: "easeOut",
    layout: { duration: 0.4, ease: "easeInOut" }
  }}

className={`grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] items-center bg-white shadow rounded-xl px-6 py-3 mb-3 ${rowBorder(emp.status, isAdmin)}`}
>
        <Link
          href={`/employees/${emp.id}`}
          className="text-emerald-700 font-medium hover:bg-emerald-50 px-2 py-[2px] rounded w-fit"
        >
          {emp.name}
        </Link>

        <span className={`inline-flex w-fit items-center px-3 py-[2px] rounded-full text-xs ${statusBadge(emp.status)}`}>
          {emp.status}
        </span>

        <span className={`inline-flex w-fit items-center px-3 py-[2px] rounded-full text-xs ${rankBadgeColor(emp.rank)}`}>
          {isAdmin && <span className="mr-2">🐼</span>}
          {emp.rank}
        </span>

        <div className="text-emerald-700 font-medium text-sm">
          {isAdmin ? "∞" : `$${emp.wage}/hr`}
        </div>

        <div className="text-emerald-700 font-medium text-sm">
          {emp.minutes > 0
            ? `${emp.hours}h ${emp.minutes % 60}m`
            : `${emp.hours}h`}
        </div>

        <div className="text-emerald-700 font-semibold text-sm">
          {isAdmin ? "∞" : `$${emp.earnings}`}
        </div>

        <div
          className={
            isAdmin
              ? "text-purple-500 font-semibold text-sm"
              : emp.goal_met
              ? "text-emerald-600 font-medium"
              : "text-red-500 font-medium"
          }
        >
          {isAdmin ? "Always" : emp.goal_met ? "Met" : "Not Met"}
        </div>
      </motion.div>
    );
  })}
</AnimatePresence>
</motion.div> 
    </div>
  );
}