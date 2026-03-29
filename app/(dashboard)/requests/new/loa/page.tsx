"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* 🔥 IMPORT YOUR COMPONENTS */
import StyledDatePicker from "@/components/StyledDatePicker";
import StyledDropdown from "@/components/StyledDropdown";

export default function NewLOARequestPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    type: "LOA",
    reason: "",
    start_date: "",
    end_date: "",
  });

async function handleSubmit() {
  setLoading(true);

  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("You must be logged in");
      return;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        user_id: user.id,
      }),
    });

    const data = await res.json();

    console.log("SUBMIT RESPONSE:", data);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    window.location.href = "/requests";
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-8">

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Submit LOA / ROA Request
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-xl shadow p-6 space-y-6"
      >
        {/* 🔥 TYPE (CUSTOM DROPDOWN) */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Request Type
          </label>

          <StyledDropdown
            placeholder="Select request type"
            value={form.type}
            onChange={(value) =>
              setForm({ ...form, type: value })
            }
            options={[
              { id: "LOA", name: "LOA" },
              { id: "ROA", name: "ROA" },
            ]}
            width="100%"
          />
        </div>

        {/* 🔥 DATES (CUSTOM PICKERS) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-emerald-700">
              Start Date
            </label>

            <StyledDatePicker
              value={form.start_date}
              onChange={(value) =>
                setForm({ ...form, start_date: value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-emerald-700">
              End Date
            </label>

            <StyledDatePicker
              value={form.end_date}
              onChange={(value) =>
                setForm({ ...form, end_date: value })
              }
            />
          </div>
        </div>

        {/* 🔥 REASON */}
        <div>
          <label className="text-sm font-semibold text-emerald-700">
            Reason
          </label>

          <textarea
            rows={4}
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
            className="
              w-full mt-1 px-4 py-2 rounded-md
              border border-emerald-300 bg-white
              text-emerald-700 outline-none
              focus:ring-2 focus:ring-emerald-500
              transition
            "
            placeholder="Explain your request..."
          />
        </div>

        {/* 🔥 ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          
          {/* MINT OUTLINE */}
          <button
            onClick={() => window.history.back()}
            className="
              px-4 py-2 text-sm rounded-md
              border border-emerald-400
              text-emerald-600
              hover:bg-emerald-50
              transition
            "
          >
            Cancel
          </button>

          {/* PRIMARY */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-4 py-2 text-sm rounded-md
              bg-emerald-600 text-white
              hover:bg-emerald-700
              transition
            "
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}