"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker";
import { motion } from "framer-motion";

export default function HoursLog() {
  const [hoursData, setHoursData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterWorkDate, setFilterWorkDate] = useState("");
  const [filterSubmissionDate, setFilterSubmissionDate] = useState("");
  const [filterHours, setFilterHours] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // ✅ STEP 1: work hours
      const { data: hours, error } = await supabase
        .from("work_hours")
        .select("id, hours, minutes, work_date, created_at, employee_id, submitted_by")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      // ✅ STEP 2: employees
      const { data: empData } = await supabase
        .from("employees")
        .select("id, name");

      // ✅ STEP 3: profiles (WITH employee_id)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, employee_id");

      // ✅ STEP 4: maps
      const empMap: any = {};
      empData?.forEach((e) => {
        empMap[e.id] = e.name;
      });

      const profileToEmployee: any = {};
      profiles?.forEach((p) => {
        profileToEmployee[p.id] = p.employee_id;
      });

      // ✅ STEP 5: merge (🔥 FIXED HERE)
      const formatted = (hours || []).map((entry) => ({
        ...entry,
        employee_name: empMap[entry.employee_id] || "Unknown",

        submitted_by_name:
          empMap[
            profileToEmployee[entry.submitted_by]
          ] || "Unknown",
      }));

      setHoursData(formatted);
      setEmployees(empData || []);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  // ✅ DELETE
  async function handleDelete(id: string, employee_id: string, hours: number, minutes: number) {

    await supabase.from("work_hours").delete().eq("id", id);

    setHoursData((prev) => prev.filter((e) => e.id !== id));

    await updateEmployeeData(employee_id, hours, minutes);
  }

  // ✅ UPDATE EMPLOYEE
  async function updateEmployeeData(employee_id: string, hours: number, minutes: number) {
    const { data: emp } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employee_id)
      .maybeSingle();

    const remove = hours * 60 + minutes;

    const newMinutes = Math.max((emp?.worked_minutes || 0) - remove, 0);
    const newWeekly = Math.max((emp?.weekly_minutes || 0) - remove, 0);

    const newHours = Math.floor(newMinutes / 60);
    const newWeeklyHours = Math.floor(newWeekly / 60);

    const wage = emp?.wage || 0;

    await supabase.from("employees").update({
      worked_minutes: newMinutes,
      paid_hours: newHours,
      weekly_minutes: newWeekly,
      weekly_hours: newWeeklyHours,
      weekly_earnings: newWeeklyHours * wage,
      lifetime_hours: newHours,
      lifetime_earnings: newHours * wage,
    }).eq("id", employee_id);
  }

  // ✅ FILTERS
  const filtered = hoursData
    .filter((e) => {
      if (filterEmployee && e.employee_id !== filterEmployee) return false;
      if (filterWorkDate && e.work_date !== filterWorkDate) return false;

      if (
        filterSubmissionDate &&
        e.created_at &&
        e.created_at.split("T")[0] !== filterSubmissionDate
      ) return false;

      return true;
    })
    .sort((a, b) => {
      const aMin = a.hours * 60 + a.minutes;
      const bMin = b.hours * 60 + b.minutes;

      if (filterHours === "asc") return aMin - bMin;
      if (filterHours === "desc") return bMin - aMin;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) return <div>Loading...</div>;

return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="w-full px-10 py-8"
  >

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Hours Log
      </h1>

      {/* FILTERS */}
      <motion.div
  className="flex gap-4 mb-8 items-end"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>

        <div className="w-[220px] flex flex-col">
          <label className="text-xs text-emerald-700 font-semibold mb-1">
            Employee
          </label>
          <StyledDropdown
            value={filterEmployee}
            onChange={setFilterEmployee}
            placeholder="Select employee"
            options={employees.map(e => ({
              id: e.id,
              name: e.name
            }))}
          />
        </div>

        <div className="w-[220px] flex flex-col">
          <label className="text-xs text-emerald-700 font-semibold mb-1">
            Work Date
          </label>
          <StyledDatePicker
            value={filterWorkDate}
            onChange={setFilterWorkDate}
          />
        </div>

        <div className="w-[220px] flex flex-col">
          <label className="text-xs text-emerald-700 font-semibold mb-1">
            Submission Date
          </label>
          <StyledDatePicker
            value={filterSubmissionDate}
            onChange={setFilterSubmissionDate}
          />
        </div>

        <div className="w-[200px] flex flex-col">
          <label className="text-xs text-emerald-700 font-semibold mb-1">
            Sort Time
          </label>
          <StyledDropdown
            value={filterHours}
            onChange={setFilterHours}
            placeholder="Sort"
            options={[
              { id: "asc", name: "Lowest Time" },
              { id: "desc", name: "Highest Time" },
            ]}
          />
        </div>

      </motion.div>

      {/* TABLE */}
      <motion.div
  className="grid grid-cols-[4fr_2fr_2fr_2fr_1fr] text-sm font-semibold text-emerald-700 px-6 mb-3"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.15 }}
>
        <div>Employee</div>
        <div>Time</div>
        <div>Work Date</div>
        <div>Submitted By</div>
        <div></div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="text-gray-500">No records found</div>
      ) : (
       filtered.map((entry, i) => (
  <motion.div
    key={entry.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.03 }}
    className="grid grid-cols-[4fr_2fr_2fr_2fr_1fr] items-center bg-white shadow rounded-xl px-6 py-2 mb-3 border border-emerald-300 text-emerald-700"
  >
            <div className="font-medium">
              {entry.employee_name}
            </div>

            <div>
              {entry.hours}h {entry.minutes}m
            </div>

            <div>
              {entry.work_date
                ? new Date(entry.work_date).toLocaleDateString()
                : "-"}
            </div>

            <div>
              {entry.submitted_by_name}
            </div>

           <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-red-500 text-white px-3 py-1 rounded-md"
              onClick={() =>
                handleDelete(entry.id, entry.employee_id, entry.hours, entry.minutes)
              }
            >
              Delete
            </motion.button>
          </motion.div>
        ))
      )}

   </motion.div>
  );
}