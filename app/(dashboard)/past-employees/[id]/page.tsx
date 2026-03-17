"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StyledDropdown from "@/components/StyledDropdown";

const API = "/api/employees"; // Correct API path

export default function PastEmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [terminationHistory, setTerminationHistory] = useState<any[]>([]);
  const [rehireStatus, setRehireStatus] = useState<string>(""); // Default status is empty initially

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
    const res = await fetch(`/api/employees/${id}/rehire`, { // Correct endpoint for rehire
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Active", // Set the employee's status to Active
        rank_id: employee?.rank_id, // Set the employee's rank back to the original rank
      }),
    });

    const data = await res.json();
    if (data.success) {
      router.push("/past-employees"); // Redirect to past employees page
    } else {
      console.error("Failed to rehire the employee.");
    }
  };

  if (!employee) {
    return <div className="p-10 text-gray-500">Loading employee...</div>;
  }

  return (
    <div className="max-w-[1050px] mx-auto py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Past Employee Profile</h1>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xl font-bold text-emerald-700">{employee?.name}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`rank-badge rank-${employee.rank?.toLowerCase()}`} >
              {employee.rank}
            </span>
          </div>
        </div>

        {/* Rehire Status Dropdown */}
        <StyledDropdown
          placeholder="Rehire Status"
          options={[
            { id: "Eligible", name: "Eligible" },
            { id: "Ineligible", name: "Ineligible" },
          ]}
          value={rehireStatus}
          onChange={handleRehireStatusChange}
          width="150px" // Adjust width here
        />
      </div>

      {/* EMPLOYMENT & CONTACT */}
      <div className="grid grid-cols-2 gap-6">
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
              <div className="text-emerald-500">{employee?.phone || "N/A"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-emerald-700">CID</div>
              <div className="text-emerald-500">{employee?.cid || "N/A"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-emerald-700">IBAN</div>
              <div className="text-emerald-500">{employee?.iban || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOURS & EARNINGS PANEL */}
      <div className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-lg font-bold text-emerald-700 mb-4">Hours & Earnings</h2>
        <div className="grid grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">
              {employee?.weekly_hours ?? 0}
            </div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">
              {employee?.lifetime_hours ?? 0}
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
      </div>

      {/* TERMINATION HISTORY PANEL */}
      <div className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-lg font-bold text-emerald-700 mb-4">Termination History</h2>
        <div className="flex gap-4 items-center mb-4">
          {/* Termination Reason Input */}
          <input
            type="text"
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            placeholder="Reason for termination"
            className="flex-1 border border-emerald-300 rounded px-3 py-2 text-sm text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          {/* Update Button */}
          <button
            onClick={handleTerminationUpdate}
            className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700"
          >
            Update
          </button>
        </div>

        <div className="space-y-2">
          {terminationHistory.map((termination, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm"
            >
              <div className="text-emerald-700">{termination.reason}</div>
              <div className="text-emerald-600">
                {new Date(termination.termination_date).toLocaleDateString()}
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
      </div>

      {/* REHIRE BUTTON */}
      <div className="mt-8">
        <button
          onClick={handleRehire}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Rehire
        </button>
      </div>
    </div>
  );
}