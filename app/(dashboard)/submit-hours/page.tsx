"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StyledDatePicker from "@/components/StyledDatePicker";
import StyledDropdown from "@/components/StyledDropdown";

export default function SubmitHoursPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employee, setEmployee] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hours, setHours] = useState<string>(""); // Hours input
  const [minutes, setMinutes] = useState<string>("0"); // Minutes input

  // Load employees when the page is loaded
  useEffect(() => {
    async function loadEmployees() {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    }

    loadEmployees();
  }, []);

  // Get the current logged-in user
 const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return null;
  }

  return data.user;
};

  // Submit hours
  async function submitHours(e: any) {
    e.preventDefault();

    // Allow submission if hours are empty but minutes are provided
    if (!employee || !date || (hours === "" && minutes === "")) {
      alert("Please fill out all fields.");
      return;
    }

    // If hours are empty, set hours to 0
    const submittedHours = hours === "" ? "0" : hours;

    // Get the current logged-in user
    const user = await getUser();
    if (!user) {
      alert("You must be logged in to submit hours.");
      return;
    }

    // Send the data to the server
    const res = await fetch("/api/hours/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employee,
        work_date: date,
        hours: submittedHours,
        minutes,
        submitted_by: user.id, // Send the logged-in user's ID
      }),
    });

    if (res.ok) {
      // Reset form values
      setHours("");
      setMinutes("0");
      setEmployee("");
      setDate("");
    } else {
      alert("Failed to submit hours.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-emerald-700 mb-10">Submit Hours</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <form onSubmit={submitHours} className="space-y-7">
          {/* EMPLOYEE AND DATE PICKER SIDE BY SIDE */}
          <div className="grid grid-cols-2 gap-6">
            {/* EMPLOYEE */}
            <div className="flex flex-col">
              <label className="text-sm text-emerald-700 font-bold mb-1">Employee</label>
              <StyledDropdown
                value={employee}
                onChange={setEmployee} // Directly passing the new value
                options={employees.map((emp) => ({ id: emp.id, name: emp.name }))}
                width="100%" // Full width for better alignment
                placeholder={""}
              />
            </div>

            {/* DATE */}
            <div className="flex flex-col">
              <label className="text-sm text-emerald-700 font-bold mb-1">Work Date</label>
              <StyledDatePicker value={date} onChange={setDate} />
            </div>
          </div>

          {/* HOURS AND MINUTES ROW */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-emerald-700 font-bold mb-1">Hours</label>
              <input
                type="number"
                required={false}  // Allow the field to be empty
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="border-2 border-[#A8F4D7] rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-emerald-700 font-bold mb-1">Minutes</label>
              <input
                type="number"
                required
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="border-2 border-[#A8F4D7] rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none font-normal text-black"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="pt-3">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 transition"
            >
              Submit Hours
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}