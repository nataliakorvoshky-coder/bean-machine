"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StyledDatePicker from "@/components/StyledDatePicker";
import StyledDropdown from "@/components/StyledDropdown";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function SubmitHoursPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employee, setEmployee] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("0");

  /* ========================= */
  /* 🔥 ANIMATION SYSTEM       */
  /* ========================= */

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  /* ========================= */
  /* LOAD EMPLOYEES            */
  /* ========================= */

  useEffect(() => {
    async function loadEmployees() {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    }

    loadEmployees();
  }, []);

  /* ========================= */
  /* AUTH USER                 */
  /* ========================= */

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return data.user;
  };

  /* ========================= */
  /* SUBMIT HOURS              */
  /* ========================= */

  async function submitHours(e: any) {
    e.preventDefault();

    if (!employee || !date || (hours === "" && minutes === "")) {
      alert("Please fill out all fields.");
      return;
    }

    const submittedHours = hours === "" ? "0" : hours;

    const user = await getUser();
    if (!user) {
      alert("You must be logged in to submit hours.");
      return;
    }

    const res = await fetch("/api/hours/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employee,
        work_date: date,
        hours: submittedHours,
        minutes,
        submitted_by: user.id,
      }),
    });

    if (res.ok) {
      setHours("");
      setMinutes("0");
      setEmployee("");
      setDate("");
    } else {
      alert("Failed to submit hours.");
    }
  }

  /* ========================= */
  /* UI                        */
  /* ========================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-[1050px] mx-auto py-8"
    >
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Submit Hours
      </h1>

      {/* 🔥 CASCADE WRAPPER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* MAIN PANEL */}
        <motion.div
          variants={panelVariants}
          className="bg-white rounded-xl shadow p-8"
        >
          <form onSubmit={submitHours} className="space-y-7">

            {/* EMPLOYEE + DATE */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm text-emerald-700 font-bold mb-1">
                  Employee
                </label>
                <StyledDropdown
                  value={employee}
                  onChange={setEmployee}
                  options={employees.map((emp) => ({
                    id: emp.id,
                    name: emp.name,
                  }))}
                  width="100%"
                  placeholder=""
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-emerald-700 font-bold mb-1">
                  Work Date
                </label>
                <StyledDatePicker value={date} onChange={setDate} />
              </div>
            </div>

            {/* HOURS + MINUTES */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm text-emerald-700 font-bold mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="border-2 border-[#A8F4D7] rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-emerald-700 font-bold mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="border-2 border-[#A8F4D7] rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="pt-3 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 transition"
              >
                Submit Hours
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}