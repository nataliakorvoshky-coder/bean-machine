"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PastEmployeesPage = () => {
  const [pastEmployees, setPastEmployees] = useState<any[]>([]); // Make sure it's an array
  const [search, setSearch] = useState(""); // For search functionality

  useEffect(() => {
    loadPastEmployees();
  }, []);

  async function loadPastEmployees() {
    try {
      const res = await fetch("/api/employees/past");
      const data = await res.json();

      console.log("API Response: ", data); // Log the response to see what it's returning

      if (Array.isArray(data)) {
        setPastEmployees(data); // If it's an array, set the state
      } else {
        console.error("API did not return an array:", data);
        setPastEmployees([]); // If not, set an empty array
      }
    } catch (err) {
      console.error("Error loading past employees:", err);
      setPastEmployees([]); // Fallback to empty array if error occurs
    }
  }

  // Filter past employees based on search input
  const filteredEmployees = pastEmployees.filter((emp) => {
    const query = search.toLowerCase();
    return emp.name.toLowerCase().includes(query); // Filter by employee name
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-left">Past Employees</h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-start">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 sm:w-1/3 text-sm outline-none text-gray-700 px-4 py-2 rounded-md border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 w-full text-sm font-semibold text-emerald-700 px-6 mb-3">
        <div className="text-center">Name</div>
        <div className="text-center">Rank</div>
        <div className="text-center">Termination Date</div>
        <div className="text-center">Hire Date</div>
        <div className="text-center">Rehire Status</div>
      </div>

      {/* Displaying Past Employee Rows */}
      {filteredEmployees.map((emp) => (
        <div
          key={emp.id}
          className="grid grid-cols-5 w-full items-center bg-white shadow rounded-xl px-6 py-2 mb-3"
        >
          {/* Link to Past Employee Profile */}
          <Link
            href={`/past-employees/${emp.id}`}
            className="text-emerald-700 font-medium hover:bg-emerald-50 px-2 py-[2px] rounded w-full text-center"
          >
            {emp.name}
          </Link>

          {/* Rank */}
          <div className="text-center text-emerald-600">
            {emp.rank || <span className="text-emerald-600">N/A</span>}
          </div>

          {/* Termination Date */}
          <div className="text-center">
            {emp.termination_date && emp.termination_date !== "N/A" ? (
              <span className="text-emerald-600">{new Date(emp.termination_date).toLocaleDateString()}</span>
            ) : (
              <span className="text-emerald-600">N/A</span>
            )}
          </div>

          {/* Hire Date */}
          <div className="text-center text-emerald-600">
            {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : <span className="text-emerald-600">N/A</span>}
          </div>

          {/* Rehire Status */}
          <div 
            className={`text-center ${emp.rehire_status === "Eligible" ? "text-emerald-600 glow-green" : emp.rehire_status === "Ineligible" ? "text-red-600 glow-red" : "text-emerald-600"}`}
          >
            {emp.rehire_status || <span className="text-emerald-600">N/A</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PastEmployeesPage;