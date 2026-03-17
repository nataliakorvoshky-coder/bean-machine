"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StyledDropdown from "@/components/StyledDropdown";
import '../../globals.css'; // Import the updated global styles

const API = "/api/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(""); // Combined filter state

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const res = await fetch(API);
    const data = await res.json();
    console.log("Fetched Employees:", data);  // Check what data you're receiving
    setEmployees(Array.isArray(data) ? data : []);
  }

  const filterEmployees = (employee: any) => {
    if (!filter || filter === "No Filter") return true; // No filter or No Filter selected, show all employees

    // Filter based on hours worked
    if (filter.includes("Low to High Hours") && employee.hours < 1) return false;
    if (filter.includes("High to Low Hours") && employee.hours > 10) return false;

    // Filter based on rank - Only "Rank High to Low" or "Rank Low to High"
    if (filter.includes("High to Low Rank") && employee.rank !== "Coffee Panda") return false;
    if (filter.includes("Low to High Rank") && employee.rank === "Croissant") return false;

    // Filter based on goal
    if (filter.includes("Goal Met") && !employee.goal_met) return false;
    if (filter.includes("Goal Not Met") && employee.goal_met) return false;

    return true;
  };

  const filteredEmployees = employees
    .filter((emp) => emp.status !== "Terminated") // Filter out terminated employees
    .filter((emp) => {
      if (!search) return true;
      const name = emp.name.toLowerCase();
      const query = search.toLowerCase();
      return name.startsWith(query) || name.includes(query);
    })
    .filter(filterEmployees)
    .sort((a, b) => {
      if (a.rank === "Coffee Panda") return -1;
      if (b.rank === "Coffee Panda") return 1;
      return 0;
    });

  // Badge color based on status
  function statusBadge(status: string) {
    if (status === "Active") {
      return "bg-emerald-100 text-emerald-700";
    }
    if (status === "ROA" || status === "LOA") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-gray-100 text-gray-600";
  }

  // Rank badge color based on rank with opacity
  function rankBadgeColor(rank: string) {
    switch (rank) {
      case "Macchiato":
        return "bg-[var(--macchiato)] text-white";  // Rose for Macchiato
      case "Cappuccino":
        return "bg-[var(--cappuccino)] text-white";    // Electric Blue for Cappuccino
      case "Latte":
        return "bg-[var(--latte)] text-white";  // Petal Forest for Latte
      case "Mocha":
        return "bg-[var(--mocha)] text-white";  // Sea Green for Mocha
      case "Iced Coffee":
        return "bg-[var(--iced-coffee)] text-white";  // Amber for Iced Coffee
      case "Frappuccino":
        return "bg-[var(--frappuccino)] text-white";  // Lilac for Frappuccino
      case "Croissant":
        return "bg-[var(--croissant)] text-white";  // Royal Gold for Croissant
      case "Coffee Panda":
        return "bg-[var(--coffee-panda)] text-white";  // Purple for Coffee Panda
      case "Bean":
        return "bg-[var(--bean)] text-gray-700";    // Platinum for Bean
      case "Coffee":
        return "bg-[var(--coffee)] text-white";    // Sapphire for Coffee
      default:
        return "bg-gray-100 text-gray-600";  // Default gray color
    }
  }

  // Row Border Color based on status and admin check
  function rowBorder(status: string, isAdmin: boolean) {
    if (isAdmin) {
      return "border-none shadow-[0px_0px_4px_2px_rgba(138,43,226,0.6)] hover:shadow-[0px_0px_8px_3px_rgba(138,43,226,0.8)]";
    }

    if (status === "Active") {
      return "border border-emerald-400";
    }

    if (status === "ROA" || status === "LOA") {
      return "border border-yellow-400";
    }

    return "border border-gray-200";
  }

  const totalMinutes = employees.reduce((acc, e) => {
    const hours = e.hours ?? 0;
    const minutes = e.minutes ?? 0;
    return acc + (hours * 60) + minutes;
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="w-full px-10 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-700">Employees</h1>

        <div className="bg-white shadow rounded-xl px-5 py-3 w-[200px] text-right">
          <div className="text-xs text-gray-500">Total Employee Hours</div>
          <div className="text-lg font-semibold text-emerald-700">
            {totalHours}h {remainingMinutes}m
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-4 items-center">
        <div className="flex-grow max-w-[400px]">
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none text-gray-700 px-4 py-2 rounded-md border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-[220px]">
          <StyledDropdown
            value={filter}
            onChange={setFilter}
            placeholder="Filter by Status/Rank/Hours/Goal"
            options={[
              { id: "No Filter", name: "No Filter" },
              { id: "Active", name: "Active" },
              { id: "ROA", name: "ROA" },
              { id: "LOA", name: "LOA" },
              { id: "High to Low Rank", name: "High to Low Rank" },
              { id: "Low to High Rank", name: "Low to High Rank" },
              { id: "High to Low Hours", name: "High to Low Hours" },
              { id: "Low to High Hours", name: "Low to High Hours" },
              { id: "Goal Met", name: "Goal Met" },
              { id: "Goal Not Met", name: "Goal Not Met" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] text-sm font-semibold text-emerald-700 px-6 mb-3">
        <div>Name</div>
        <div>Status</div>
        <div>Rank</div>
        <div>Wage</div>
        <div>Hours</div>
        <div>Earnings</div>
        <div>Goal</div>
      </div>

      {/* Displaying Employee Rows */}
      {filteredEmployees.map((emp) => {
        const isAdmin = emp.rank === "Coffee Panda";  // Assuming rank "Coffee Panda" is the admin
        return (
          <div
            key={emp.id}
            className={`grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] items-center bg-white shadow rounded-xl px-6 py-2 mb-3 ${rowBorder(
              emp.status,
              isAdmin
            )}`}
          >
            <Link
              href={`/employees/${emp.id}`}
              className="text-emerald-700 font-medium hover:bg-emerald-50 px-2 py-[2px] rounded w-fit"
            >
              {emp.name}
            </Link>

            {/* STATUS */}
            <div>
              <span
                className={`px-2 py-[2px] rounded-full text-xs ${statusBadge(
                  emp.status
                )}`}
              >
                {emp.status}
              </span>
            </div>

            {/* RANK */}
            <div>
              <span className={`${rankBadgeColor(emp.rank)} px-2 py-[2px] rounded-full text-xs`}>
                {isAdmin && <span className="panda-emoji inline-block mr-2">🐼</span>}
                {emp.rank}
              </span>
            </div>

            {/* WAGE */}
            <div className="text-emerald-700 font-medium text-sm">
              {isAdmin ? "∞" : `$${emp.wage}/hr`}
            </div>

            {/* HOURS */}
            <div className="text-emerald-700 font-medium text-sm">{emp.hours ?? 0}</div>

            {/* EARNINGS */}
            <div className="text-emerald-700 font-semibold text-sm">
              {isAdmin ? "∞" : `$${emp.earnings ?? 0}`}
            </div>

            {/* GOAL */}
            <div
              className={isAdmin
                ? "text-purple-500 font-semibold text-sm"
                : emp.goal_met
                ? "text-emerald-600"
                : "text-red-500"}
            >
              {isAdmin ? "Always" : emp.goal_met ? "Met" : "Not Met"}
            </div>
          </div>
        );
      })}
    </div>
  );
}