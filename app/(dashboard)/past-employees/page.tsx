"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const PastEmployeesPage = () => {
  const [pastEmployees, setPastEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    loadPastEmployees();

    const channel = supabase
      .channel("past-employees-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        loadPastEmployees
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "termination_history" },
        loadPastEmployees
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadPastEmployees() {
    const res = await fetch("/api/employees/past");
    const data = await res.json();

    setPastEmployees(Array.isArray(data) ? data : []);
  }

  /* 🔥 TRUE CASCADE TRIGGER (AFTER DOM READY) */
  useEffect(() => {
    if (!pastEmployees.length) return;

    setAnimate(false);

    const t = setTimeout(() => {
      setAnimate(true);
    }, 120); // 🔥 IMPORTANT

    return () => clearTimeout(t);
  }, [pastEmployees]);

  const filteredEmployees = pastEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Past Employees
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 sm:w-1/3 text-sm text-emerald-700 px-4 py-2 rounded-md border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-5 text-sm font-semibold text-emerald-700 px-6 mb-3">
        <div className="text-center">Name</div>
        <div className="text-center">Rank</div>
        <div className="text-center">Termination Date</div>
        <div className="text-center">Hire Date</div>
        <div className="text-center">Rehire Status</div>
      </div>

      {/* 🔥 PARENT CONTROLS STAGGER ONLY */}
      <motion.div
        initial="hidden"
        animate={animate ? "show" : "hidden"}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.14,
              delayChildren: 0.1,
            },
          },
        }}
      >
        <AnimatePresence>
          {filteredEmployees.map((emp) => {
            const status =
              emp.rehire_eligible ??
              emp.rehire_status ??
              "N/A";

            return (
              <motion.div
                key={emp.id}
                layout
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 50, // 🔥 BELOW
                  },
                  show: {
                    opacity: 1,
                    y: 0, // 🔥 MOVE UP INTO PLACE
                    transition: {
                      duration: 0.45,
                      ease: [0.25, 0.1, 0.25, 1],
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: -50, // 🔥 SLIDE UP OUT
                    scale: 0.95,
                    transition: { duration: 0.25 },
                  },
                }}
                className="grid grid-cols-5 items-center bg-white shadow rounded-xl px-6 py-2 mb-3"
              >
                <Link
                  href={`/past-employees/${emp.id}`}
                  className="text-emerald-700 font-medium hover:bg-emerald-50 px-2 py-[2px] rounded text-center"
                >
                  {emp.name}
                </Link>

                <div className="text-center text-emerald-600">
                  {emp.rank || "N/A"}
                </div>

                <div className="text-center text-emerald-600">
                  {emp.termination_date
                    ? new Date(emp.termination_date).toLocaleDateString()
                    : "N/A"}
                </div>

                <div className="text-center text-emerald-600">
                  {emp.hire_date
                    ? new Date(emp.hire_date).toLocaleDateString()
                    : "N/A"}
                </div>

                <div
                  className={`text-center font-semibold ${
                    status === "Eligible"
                      ? "text-emerald-600"
                      : status === "Ineligible"
                      ? "text-red-600 glow-red"
                      : "text-gray-400"
                  }`}
                >
                  {status}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PastEmployeesPage;