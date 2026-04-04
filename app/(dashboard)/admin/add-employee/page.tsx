"use client";

import { useState, useEffect } from "react";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker"; // Import StyledDatePicker

const API = "/api/employees";

export default function CreateEmployeePage() {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [lastPromotionDate, setLastPromotionDate] = useState(""); // Add last promotion date state
  const [phone, setPhone] = useState("");
  const [cid, setCid] = useState("");
  const [iban, setIban] = useState("");

  const [ranks, setRanks] = useState<any[]>([]);

  useEffect(() => {
    loadRanks();
  }, []);

  async function loadRanks() {
    const res = await fetch("/api/employee-ranks");
    const data = await res.json();

    setRanks(Array.isArray(data) ? data : []);
  }

  async function createEmployee(e?: any) {
  if (e) e.preventDefault();

    const employeeData = {
      name,
      rank_id: rank,
      hire_date: hireDate,
      last_promotion_date: lastPromotionDate, // Add the last promotion date to the data
      phone,
      cid,
      iban,
    };

    console.log("Employee data being sent:", employeeData); // Check the data being sent

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });

    if (res.ok) {
      const responseData = await res.json();
      console.log("Employee creation response:", responseData); // Log the response

      setName("");
      setRank("");
      setHireDate("");
      setLastPromotionDate(""); // Reset Last Promotion Date field
      setPhone("");
      setCid("");
      setIban("");
    } else {
      try {
        const errorData = await res.json();
        console.error("Error creating employee:", errorData.error);
        alert(`Error creating employee: ${errorData.error || "Unknown error"}`);
      } catch (jsonError) {
        console.error("Failed to parse error response", jsonError);
        alert("An error occurred while creating the employee.");
      }
    }
  }

  const inputStyle =
    "w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-8">Create Employee Profile</h1>

      <div className="bg-white rounded-xl shadow p-8">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-6">
            {/* Employee Name */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Employee Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputStyle}
              />
            </div>

            {/* Rank */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Rank</label>
              <StyledDropdown
                placeholder="Select Rank"
                options={ranks.map((r) => ({
                  id: r.id,
                  name: r.rank_name,
                }))}
                value={rank}
                onChange={setRank}
              />
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Hire Date</label>
              <StyledDatePicker value={hireDate} onChange={setHireDate} />
            </div>

            {/* Last Promotion Date */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Last Promotion Date</label>
              <StyledDatePicker
                value={lastPromotionDate} // Use the state for last promotion date
                onChange={setLastPromotionDate} // Set the value of the state when the date is changed
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyle} />
            </div>

            {/* CID */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">CID</label>
              <input value={cid} onChange={(e) => setCid(e.target.value)} className={inputStyle} />
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">IBAN</label>
              <input value={iban} onChange={(e) => setIban(e.target.value)} className={inputStyle} />
            </div>
          </div>

          <button
  type="button"
  onClick={createEmployee}
            className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition"
          >
            Create Employee
          </button>
        </form>
      </div>
    </div>
  );
}