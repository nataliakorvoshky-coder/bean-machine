"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HoursLog() {
  const [hoursData, setHoursData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoursLog = async () => {
      try {
        const { data, error } = await supabase
          .from("work_hours")
          .select("id, employee_id, hours, created_at") // Assuming these columns are present
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching hours log:", error);
          return;
        }

        // Get employee names from the employee table using employee_id
        const employeeIds = data.map((entry: any) => entry.employee_id);
        const { data: employees, error: employeeError } = await supabase
          .from("employees")
          .select("id, name")
          .in("id", employeeIds);

        if (employeeError) {
          console.error("Error fetching employee names:", employeeError);
          return;
        }

        // Combine work hours with employee names
        const combinedData = data.map((entry: any) => {
          const employee = employees.find((emp: any) => emp.id === entry.employee_id);
          return { ...entry, employee_name: employee ? employee.name : "Unknown" };
        });

        setHoursData(combinedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchHoursLog();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this entry?");
    if (confirmation) {
      try {
        const { error } = await supabase
          .from("work_hours")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting hours entry:", error);
          return;
        }

        // Remove the entry from the local state after successful deletion
        setHoursData((prevData) => prevData.filter((entry) => entry.id !== id));
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  if (loading) {
    return <div>Loading hours log...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Hours Log</h1>

      <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="px-6 py-3 text-left">Employee</th>
            <th className="px-6 py-3 text-left">Hours</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hoursData.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
                No records found.
              </td>
            </tr>
          ) : (
            hoursData.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-3">{entry.employee_name}</td>
                <td className="px-6 py-3">{entry.hours} hours</td>
                <td className="px-6 py-3">{new Date(entry.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}