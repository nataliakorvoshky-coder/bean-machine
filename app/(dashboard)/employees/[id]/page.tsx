"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StyledDropdown from "@/components/StyledDropdown"; // Assuming you have a styled dropdown component

const API = "/api/employees";

export default function EmployeeProfilePage() {
  const params = useParams();
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
        setEmployee(data);
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
// Rank Badge Color Helper
function rankBadgeColor(rank: string) {
  if (rank === "Coffee Panda") {
    return "bg-purple-100 text-purple-600"; // Purple for Coffee Panda
  }

  const rankColors: { [key: string]: string } = {
    Bean: "bg-platinum text-gray-700", // Platinum for Bean
    Coffee: "bg-sapphire text-white", // Sapphire for Coffee
    Latte: "bg-petalforest text-petalforest", // Petal Forest for Latte
    Mocha: "bg-seagreen text-seagreen", // Sea Green for Mocha
    "Iced Coffee": "bg-amber text-amber", // Amber for Iced Coffee
    Cappuccino: "bg-electricblue text-white", // Electric Blue for Cappuccino
    Macchiato: "bg-rose text-rose", // Rose for Macchiato
    Frappuccino: "bg-lilac text-lilac", // Lilac for Frappuccino
    Croissant: "bg-royalgold text-royalgold", // Royal Gold for Croissant
  };

  return rankColors[rank] || "bg-gray-100 text-gray-600"; // Default gray color for unknown ranks
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

  if (!employee) {
    return <div className="p-10 text-gray-500">Loading employee...</div>;
  }

  return (
    <div className="max-w-[1050px] mx-auto py-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Employee Profile</h1>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xl font-bold text-emerald-700">{employee?.name}</div>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-3 py-[2px] rounded-full ${rankBadgeColor(employee.rank)} text-xs`}
            >
              {employee?.rank || "Rank not available"}
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
            options={[
              { id: "Active", name: "Active" },
              { id: "ROA", name: "ROA" },
              { id: "LOA", name: "LOA" },
            ]}
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

            {/* Last Promotion */}
            <div className="flex justify-between text-sm text-gray-700">
              <div className="text-emerald-700">Last Promotion</div>
              <div className="font-medium text-emerald-600">
                {employee?.last_promotion_date ? (
                  employee.last_promotion_date
                ) : (
                  <span className="text-lg align-middle">∞</span>
                )}
              </div>
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
                {employee?.is_admin_employee ? "161502" : employee?.iban || "N/A"}
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
            <div className="text-emerald-500 font-semibold text-lg">{employee?.weekly_hours ?? 0}</div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Hours</div>
            <div className="text-emerald-500 font-semibold text-lg">{employee?.lifetime_hours ?? 0}</div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Weekly Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">${employee?.weekly_earnings ?? 0}</div>
          </div>
          <div>
            <div className="text-emerald-700 text-xs mb-1">Lifetime Earnings</div>
            <div className="text-emerald-500 font-semibold text-lg">${employee?.lifetime_earnings ?? 0}</div>
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
    </div>
  );
}