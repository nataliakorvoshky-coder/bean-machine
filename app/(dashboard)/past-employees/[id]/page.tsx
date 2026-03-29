"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StyledDropdown from "@/components/StyledDropdown";
import { motion } from "framer-motion";

const API = "/api/employees"; // Correct API path

export default function PastEmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [terminationHistory, setTerminationHistory] = useState<any[]>([]);
  const [rehireStatus, setRehireStatus] = useState<string>(""); // Default status is empty initially
  const [isRehiring, setIsRehiring] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmployee();
      loadTerminationHistory();
    }
  }, [id]);

  // Fetch employee details
  async function loadEmployee() {
    try {
      const res = await fetch(`/api/employees/past/${id}`); // Correct endpoint for employee details
      const data = await res.json();
      if (data) {
        setEmployee(data);
        setRehireStatus(data.rehire_status || "N/A"); // Set rehire status from the employee data
      }
    } catch (err) {
      console.error("Error loading employee:", err);
    }
  }

  // Fetch termination history
  async function loadTerminationHistory() {
    try {
      const res = await fetch(`${API}/${id}/termination-history`); // Fetch termination history

      if (!res.ok) {
        throw new Error(`Failed to fetch termination history with status: ${res.status}`);
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        console.log("No termination history found.");
        setTerminationHistory([]); // Set empty if no data is found
      } else {
        setTerminationHistory(data); // Set the fetched termination history
      }
    } catch (err) {
      console.error("Error loading termination history:", err);
    }
  }

  // Handle Rehire Status change (This will update both frontend and backend)
  const handleRehireStatusChange = async (newStatus: string) => {
    setRehireStatus(newStatus);

    // Update the employee rehire status in the backend
    const res = await fetch(`/api/employees/past/${id}`, {  // Dynamic API path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rehire_status: newStatus }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Optionally reload employee data after updating rehire status
      loadEmployee(); // This will ensure the updated status is reflected in the dropdown
    } else {
      console.error("Failed to update rehire status");
    }
  };

  // Handle termination history update (adding a new record)
  const handleTerminationUpdate = async () => {
    const terminationDate = new Date().toISOString(); // Get current date in ISO format

    const newTermination = { date: terminationDate, reason: terminationReason };

    const res = await fetch(`${API}/${id}/termination-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        termination_date: terminationDate, // Use current date as termination date
        reason: terminationReason,
      }),
    });

    const data = await res.json();
    if (data.success) {
      loadTerminationHistory(); // Re-fetch the termination history
      setTerminationReason(""); // Clear reason input
    } else {
      console.error("Failed to update termination history.");
    }
  };

  // Handle deletion of termination history
  const handleDeleteTermination = async (terminationId: string) => {
    try {
      const url = `${API}/${id}/termination-history`; // URL without the terminationId in the path

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terminationId: terminationId, // Send terminationId in the request body
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete termination history: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setTerminationHistory((prev) =>
          prev.filter((termination) => termination.id !== terminationId)
        );
      } else {
        console.error("Failed to delete termination history:", data.error);
      }
    } catch (error) {
      console.error("Error in DELETE request:", error);
    }
  };

  // Rehire the employee
const handleRehire = async () => {
  try {
    setIsRehiring(true); // 🔥 trigger animation

    const res = await fetch(`/api/employees/${id}/rehire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Active",
        rank_id: employee?.rank_id,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setIsRehiring(false);
      console.error("Failed to rehire the employee.");
      return;
    }

    // ⏳ wait for animation to finish
    setTimeout(() => {
      router.push("/past-employees");
    }, 500);

  } catch (err) {
    setIsRehiring(false);
    console.error("Rehire error:", err);
  }
};

    /* 🔥 PANEL STAGGER */
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const panel = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35 },
    },
  };

  return (
        <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className={`max-w-[1050px] mx-auto py-8 transition-all duration-500 ${
        isRehiring
          ? "opacity-0 translate-y-6 scale-95"
          : "opacity-100"
      }`}
    > 
    
      {/* HEADER */}
      <motion.h1
        variants={panel}
        className="text-3xl font-bold text-emerald-700 mb-6"
      >
        Past Employee Profile
      </motion.h1>

      {/* NAME */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={
    employee
      ? { opacity: 1, y: 0 }
      : { opacity: 0 }
  }
  transition={{ duration: 0.3 }}
  className="text-xl font-bold text-emerald-700 min-h-[24px]"
>
  {employee?.name || ""}
</motion.div>

      {/* GRID */}
      <motion.div variants={panel} className="grid grid-cols-2 gap-6">

        {/* EMPLOYMENT */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-emerald-700 mb-4">Employment</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <div className="text-emerald-700">Hire Date</div>
              <div className="text-emerald-500">{employee?.hire_date || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-emerald-700 mb-4">Contact</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <div className="text-emerald-700">Phone</div>
              <div className="text-emerald-500">{employee?.phone ?? "N/A"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-emerald-700">CID</div>
              <div className="text-emerald-500">{employee?.cid ?? "N/A"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-emerald-700">IBAN</div>
              <div className="text-emerald-500">{employee?.iban ?? "N/A"}</div>
            </div>
          </div>
        </div>
        </motion.div>
      
      {/* HOURS & EARNINGS PANEL */}
<motion.div variants={panel} className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-lg font-bold text-emerald-700 mb-4">Hours & Earnings</h2>
        <div className="grid grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Hours</div>
<div className="text-emerald-500 font-semibold text-lg">
  {employee?.weekly_hours ?? 0}h {employee?.weekly_minutes ?? 0}m
</div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">
             {employee?.lifetime_hours ?? 0}h {employee?.lifetime_minutes ?? 0}m
            </div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">
              ${employee?.weekly_earnings ?? 0}
            </div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">
              ${employee?.lifetime_earnings ?? 0}
            </div>
          </div>
        </div>
</motion.div>

      <motion.div variants={panel} className="bg-white rounded-xl shadow p-5 mt-6">
  <h2 className="text-lg font-bold text-yellow-600 mb-3">
    Strikes
  </h2>

  <div className="text-2xl font-semibold text-yellow-700">
    {employee?.strike_count ?? 0}
  </div>
</motion.div>

      {/* TERMINATION HISTORY PANEL */}
<motion.div variants={panel} className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-lg font-bold text-emerald-700 mb-4">Termination History</h2>
        

        <div className="space-y-2">
          {terminationHistory.map((termination, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm"
            >
<div className="flex flex-col">
  <span className="text-emerald-700 font-medium">
    {termination.reason}
  </span>

  <span className="text-xs text-gray-500">
    {new Date(termination.termination_date).toLocaleDateString()}
  </span>
</div>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteTermination(termination.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
</motion.div>

      {/* REHIRE BUTTON */}
  <motion.div variants={panel} className="mt-8">
<button
  onClick={handleRehire}
  disabled={isRehiring}
  className={`bg-green-600 text-white px-6 py-2 rounded-md transition ${
    isRehiring
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-green-700"
  }`}
>
  {isRehiring ? "Rehiring..." : "Rehire"}
</button>
      </motion.div>
    </motion.div>
  );
}