"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Importing useRouter for navigation
import StyledDropdown from "@/components/StyledDropdown";
import "../../../globals.css"; // Import the updated global styles

const API = "/api/employees";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter hook for navigation
  const id = params.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [strikeReason, setStrikeReason] = useState("");
  const [strikeHistory, setStrikeHistory] = useState<any[]>([]);

useEffect(() => {
  if (id) {
    loadEmployee();
  }
}, [id]);

async function loadEmployee() {
  try {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json();
    if (data) {
      setEmployee(data); // Ensure the updated employee data is loaded
      setStatus(data.status);
      setStrikeHistory(data.strike_history ?? []);
    }
  } catch (err) {
    console.error("Error loading employee:", err);
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
      setStrikeHistory(data.history ?? []);
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
      setStrikeHistory(data.history ?? []);
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
    // Get current date as termination date
    const terminationDate = new Date().toISOString().split("T")[0];  // 'YYYY-MM-DD' format

    const res = await fetch(`${API}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Terminated",
        termination_date: terminationDate,  // Include termination date in the request
      }),
    });

    const data = await res.json();
    if (data.success) {
      // Update the employee state with the updated data including the termination date
      setEmployee({
        ...employee,
        status: "Terminated",
        termination_date: data.updated_employee.termination_date,  // Reflect the updated termination date
      });

      // Redirect to past employees page after termination
      router.push("/past-employees");
    } else {
      console.error("Failed to terminate the employee.");
    }
  };

  if (!employee) {
    return <div className="p-10 text-gray-500">Loading employee...</div>;
  }

  const isAdmin = employee.rank === "Coffee Panda"; // Check if the employee is an admin

  return (
    <div className="max-w-[1050px] mx-auto py-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Employee Profile</h1>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xl font-bold text-emerald-700">{employee?.name}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`rank-badge ${rankBadgeColor(employee.rank)}`}>
              {employee.rank}
            </span>

            {employee?.strikes > 0 && (
              <span className="px-2 py-[2px] rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                ⚠ {employee.strikes} Strike
              </span>
            )}
          </div>
        </div>

        <div className="w-[160px]">
          <StyledDropdown
            value={status}
            onChange={updateStatus}
            placeholder="Status"
            options={[{ id: "Active", name: "Active" }, { id: "ROA", name: "ROA" }, { id: "LOA", name: "LOA" }]}
          />
        </div>
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

            {/* Lifetime Hours */}
            <div className="flex justify-between text-sm text-gray-700">
              <div className="text-emerald-700">Lifetime Hours</div>
              <div className="font-medium text-emerald-600">{employee?.lifetime_hours ?? 0}</div>
            </div>

            {/* Lifetime Earnings */}
            <div className="flex justify-between text-sm text-gray-700">
              <div className="text-emerald-700">Lifetime Earnings</div>
              <div className="font-medium text-emerald-600">${employee?.lifetime_earnings ?? 0}</div>
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
              <div className="text-emerald-500">
                {employee?.iban || "N/A"}
              </div>
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

      {/* STRIKES PANEL */}
      {employee.rank !== "Coffee Panda" && (
        <div className="bg-white rounded-xl shadow p-5 mt-6">
          <h2 className="text-lg font-bold text-emerald-700 mb-4">Strike History</h2>
          <div className="flex gap-4 items-center mb-4">
            <div className="w-[70px] border border-emerald-300 rounded px-3 py-2 text-center text-emerald-600">
              {employee?.strikes + 1 || 1}
            </div>
            <input
              value={strikeReason}
              onChange={(e) => setStrikeReason(e.target.value)}
              placeholder="Add strike reason"
              className="flex-1 border border-emerald-300 rounded px-3 py-2 text-sm text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <button onClick={addStrike} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700">
              Update
            </button>
          </div>
          <div className="space-y-2">
            {strikeHistory.map((strike: any, index) => (
              <div
                key={strike.id}
                className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex gap-4 items-center">
                  <div className="text-red-500 font-semibold">#{strike.number ?? index + 1}</div>
                  <div className="text-emerald-700">{strike.reason}</div>
                  <div className="text-xs text-emerald-500">
                    {new Date(strike.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => deleteStrike(strike.id)} className="text-red-500 text-xs hover:text-red-700">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUTTONS FOR PROMOTION, DEMOTION, TERMINATION */}
      {!isAdmin && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={handlePromotion}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Promote
          </button>
          <button
            onClick={handleDemotion}
            className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700"
          >
            Demote
          </button>
          <button
            onClick={handleTermination}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Terminate
          </button>
        </div>
      )}
    </div>
  );
}