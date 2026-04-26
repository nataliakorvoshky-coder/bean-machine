"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  "Oven Fridge",
  "Coffee Fridge",
  "Prep Fridge",
];

type StockItem = {
  id: string;
  name: string;
  section: string;
  current_amount: number;
  goal_amount: number;
};

export default function StockUsagePage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [newStock, setNewStock] = useState<{ [key: string]: number | "" }>({});
  const [loading, setLoading] = useState(false);

  const HIDDEN_ITEMS = ["Batter", "Espresso", "Milk Foam"];

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
const res = await fetch("/api/inventory", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ action: "getAnalytics" }),
});
const data = await res.json();

setItems(data.items || []);
  }

function updateStock(id: string, value: string) {
  setNewStock((prev) => ({
    ...prev,
    [id]: value === "" ? "" : Number(value),
  }));
}

  async function submitUsage() {
    setLoading(true);

    try {
      const calculatedUsage: Record<string, number> = {};
      const cleanedNewStock: Record<string, number> = {};

items.forEach((item) => {
  const rawVal = newStock[item.id];

  // ✅ skip untouched or empty
  if (rawVal === undefined || rawVal === "") return;

  const newVal = Number(rawVal);
  const currentVal = Number(item.current_amount);

  // 🚫 skip if no actual change
  if (newVal === currentVal) return;

  // 🚫 prevent invalid increase
  if (newVal > currentVal) return;

  const used = currentVal - newVal;

  if (used > 0) {
    calculatedUsage[item.id] = used;
  }

  // ✅ ALWAYS update stock if changed
  cleanedNewStock[item.id] = newVal;
});

      // ✅ prevent empty submit
      if (Object.keys(calculatedUsage).length === 0) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submitUsage",
          usage: calculatedUsage,
          newStock: cleanedNewStock,
        }),
      });

      const data = await res.json();

      console.log("USAGE SUBMITTED:", data);

    

      // 🔄 refresh data
      setNewStock({});
      loadItems();

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  function renderSection(section: string) {
const list = items
  .filter(
    (i) =>
      i.section?.trim().toLowerCase() === section.toLowerCase() &&
      !HIDDEN_ITEMS.includes(i.name)
  )
  .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div key={section} className="bg-white p-4 rounded-xl shadow mb-5">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3">
          {section}
        </h2>

        <div className="grid grid-cols-2 text-xs font-semibold text-emerald-700 border-b pb-2">
          <div>Item</div>
          <div className="text-right">New Current</div>
        </div>

        {list.map((item) => {
          const percent =
            item.goal_amount > 0
              ? Math.min(
                  (item.current_amount / item.goal_amount) * 100,
                  100
                )
              : 0;

          return (
            <div
              key={item.id}
              className="grid grid-cols-2 py-2 border-b border-emerald-100 items-center"
            >
              <div>
                <div className="text-emerald-700 text-sm">
                  {item.name}
                </div>

                <div className="w-[200px] h-[5px] bg-emerald-100 rounded mt-1">
                  <div
                    className="h-[5px] bg-emerald-500 rounded"
                    style={{ width: percent + "%" }}
                  />
                </div>
              </div>

              <div className="text-right">
                <input
                  type="number"
                  min={0}
                  value={newStock[item.id] ?? ""}
                  onChange={(e) =>
                    updateStock(item.id, e.target.value)
                  }
                  className="w-[140px] border border-emerald-300 rounded-md px-3 py-1 text-sm text-right focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Current: ${item.current_amount}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Daily Stock Usage
      </h1>

      {SECTIONS.map(renderSection)}

      <div className="mt-6 flex justify-end">
        <button
          onClick={submitUsage}
          disabled={loading}
          className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Usage"}
        </button>
      </div>
    </div>
  );
}