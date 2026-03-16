"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ensure the path is correct
import { useRouter } from "next/navigation";
import StyledDropdown from "@/components/StyledDropdown"; // Adjust the path accordingly

const API = "/api/inventory";

const SECTIONS = [
  "Oven Fridge",
  "Coffee Fridge",
  "Prep Fridge",
  "Display Case"
];

type StockItem = {
  id: string;
  name: string;
  section: string;
  current_amount: number;
  goal_amount: number;
};

export default function StockItemsPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [name, setName] = useState("");
  const [section, setSection] = useState(SECTIONS[0]); // Default value for section
  const [current, setCurrent] = useState(0);
  const [goal, setGoal] = useState(0);

  const router = useRouter(); // Use router for redirection

  // Check session when the component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      load(); // Load stock items if the user is authenticated
    };

    checkSession();
  }, []);

  // API function with error handling
  async function api(action: string, payload: any = {}) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("API Response Data:", data); // Log the response data
      return data;
    } catch (error) {
      console.error("API error:", error);
      return null;
    }
  }

  // Load stock items
  const load = async () => {
    const data = await api("getStockItems");
    console.log("Loaded Stock Items:", data); // Log the response
    if (Array.isArray(data)) {
      setItems(data);
    } else {
      console.error("Failed to load stock items:", data);
    }
  };

  // Add item function
  async function addItem() {
    if (!name.trim()) return;

    console.log("Adding item with data:", {
      name,
      section,
      current_amount: current,
      goal_amount: goal,
    }); // Log data before sending

    await api("addStockItem", {
      name,
      section,
      current_amount: current,
      goal_amount: goal,
    });

    console.log("Item added successfully"); // Log success
    setName("");
    setCurrent(0);
    setGoal(0);
    load(); // Refresh stock list after adding an item
  }

  // Update current stock
  async function updateCurrent(id: string, value: number) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStockCurrent",
          id: id,
          current_amount: value,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Stock item updated:", data);

      load(); // Refresh stock list after updating current amount
    } catch (err) {
      console.error("Error updating stock item:", err);
    }
  }

  // Update goal stock
  async function updateGoal(id: string, value: number) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStockGoal",
          id: id,
          goal_amount: value,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Stock goal updated:", data);

      load(); // Refresh stock list after updating goal amount
    } catch (err) {
      console.error("Error updating stock goal:", err);
    }
  }

  // Delete stock item
  async function deleteItem(id: string) {
    // Directly call the API to delete the stock item
    const { data, error } = await api("deleteStockItem", { id });

    if (error) {
      console.error("Error deleting stock item:", error);
      return;
    }

    console.log("Stock item deleted:", data);

    load(); // Refresh stock list after deletion
  }

  return (
    <div className="max-w-[1050px]">
      <h1 className="text-2xl font-bold text-emerald-700 mb-5">
        Manage Stock Items
      </h1>

      {/* ADD ITEM PANEL */}
      <div className="bg-white p-3 rounded-xl shadow mb-5">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Item Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Section
            </label>
            {/* Replace <select> with StyledDropdown */}
            <StyledDropdown
              placeholder="Select Section"
              options={SECTIONS.map((s, index) => ({ id: s, name: s }))}
              value={section}
              onChange={setSection}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Current
            </label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Goal
            </label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={addItem}
          className="mt-3 bg-emerald-600 text-white text-sm px-5 py-1.5 rounded hover:bg-emerald-700"
        >
          Add Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white p-3 rounded-xl shadow">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] text-[11px] font-semibold text-emerald-700 border-b pb-1">
          <div>Item</div>
          <div className="text-center">Section</div>
          <div className="text-center">Current</div>
          <div className="text-center">Goal</div>
          <div className="text-right">Delete</div>
        </div>

        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] py-1.5 border-b border-emerald-100 items-center"
            >
              <div className="text-emerald-700 text-sm">{item.name}</div>

              <div className="text-center text-emerald-700 text-sm">
                {item.section}
              </div>

              <div className="text-center">
                <input
                  type="number"
                  value={item.current_amount}
                  onChange={(e) => updateCurrent(item.id, Number(e.target.value))}
                  className="w-[70px] border border-emerald-300 rounded text-center text-sm py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-center">
                <input
                  type="number"
                  value={item.goal_amount}
                  onChange={(e) => updateGoal(item.id, Number(e.target.value))}
                  className="w-[70px] border border-emerald-300 rounded text-center text-sm py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-right">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-emerald-700">No stock items found</div>
        )}
      </div>
    </div>
  );
}