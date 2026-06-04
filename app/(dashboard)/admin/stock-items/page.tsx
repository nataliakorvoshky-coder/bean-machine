"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ensure the path is correct
import { useRouter } from "next/navigation";
import StyledDropdown from "@/components/StyledDropdown"; // Adjust the path accordingly
import { motion } from "framer-motion";


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




  // Load stock items
const load = async () => {

  try {

    const res = await fetch(
      "/api/stock/get",
      {
        cache: "no-store"
      }
    )

    const data =
      await res.json()

    if (
      Array.isArray(data?.items)
    ) {

      setItems(data.items)

    } else {

      setItems([])

    }

  } catch (err) {

    console.error(err)

    setItems([])
  }
}

  // Add item function
  async function addItem() {
    if (!name.trim()) return;

    console.log("Adding item with data:", {
      name,
      section,
      current_amount: current,
      goal_amount: goal,
    }); // Log data before sending

    await fetch("/api/activity", {
  method: "POST",
  headers: {
    "Content-Type":
      "application/json"
  },
  body: JSON.stringify({

    action:
      `Added stock item "${name}"`,

    type:
      "stock",

    username:
      localStorage.getItem(
        "username"
      ),
  })
})

await fetch(
  "/api/stock/create",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json"
    },
    body: JSON.stringify({
      name,
      section,
      current_amount:
        current,
      goal_amount:
        goal
    })
  }
)

    console.log("Item added successfully"); // Log success
    setName("");
    setCurrent(0);
    setGoal(0);
    load(); // Refresh stock list after adding an item
  }

  // Update current stock
  async function updateCurrent(id: string, value: number) {
    try {
      const res = await fetch("/api/stock/update",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  id: id,
  updates: {
    current_amount: value
  }
}),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Stock item updated:", data);

      const item =
  items.find(
    i => i.id === id
  )

await fetch("/api/activity", {
  method: "POST",
  headers: {
    "Content-Type":
      "application/json"
  },
  body: JSON.stringify({

    action:
      `Updated current stock of "${item?.name}" to ${value}`,

    type:
      "stock",

    username:
      localStorage.getItem(
        "username"
      ),
  })
})

      load(); // Refresh stock list after updating current amount

      window.dispatchEvent(
  new Event("inventory-refresh")
)
    } catch (err) {
      console.error("Error updating stock item:", err);
    }
  }

  // Update goal stock
  async function updateGoal(id: string, value: number) {
    try {
      const res = await fetch(
  "/api/stock/update",
  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  id: id,
  updates: {
    goal_amount: value
  }
}),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Stock goal updated:", data);

      const item =
  items.find(
    i => i.id === id
  )

await fetch("/api/activity", {
  method: "POST",
  headers: {
    "Content-Type":
      "application/json"
  },
  body: JSON.stringify({

    action:
      `Updated goal stock of "${item?.name}" to ${value}`,

    type:
      "stock",

    username:
      localStorage.getItem(
        "username"
      ),
  })
})

      load(); // Refresh stock list after updating goal amount

      window.dispatchEvent(
  new Event("inventory-refresh")
)
    } catch (err) {
      console.error("Error updating stock goal:", err);
    }
  }

async function deleteItem(
  id: string
) {

  try {

    const item =
  items.find(
    i => i.id === id
  )

    const res = await fetch(
      "/api/stock/delete",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          id
        })
      }
    )

    const data =
      await res.json()

    console.log(
      "Deleted:",
      data
    )

    await fetch("/api/activity", {
  method: "POST",
  headers: {
    "Content-Type":
      "application/json"
  },
  body: JSON.stringify({

    action:
      `Deleted stock item "${item?.name}"`,

    type:
      "stock",

    username:
      localStorage.getItem(
        "username"
      ),
  })
})

    load()

    window.dispatchEvent(
      new Event(
        "inventory-refresh"
      )
    )

  } catch (err) {

    console.error(
      "Delete failed:",
      err
    )
  }
}

  return (
    <motion.div
  className="max-w-[1050px]"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
      <h1 className="text-2xl font-bold text-emerald-700 mb-5">
        Manage Stock Items
      </h1>

      {/* ADD ITEM PANEL */}
      <motion.div
  className="bg-white p-3 rounded-xl shadow mb-5"
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4 }}
>
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
      </motion.div>

      {/* TABLE */}
      <motion.div
  className="bg-white p-3 rounded-xl shadow"
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4 }}
>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] text-[11px] font-semibold text-emerald-700 border-b pb-1">
          <div>Item</div>
          <div className="text-center">Section</div>
          <div className="text-center">Current</div>
          <div className="text-center">Goal</div>
          <div className="text-right">Delete</div>
        </div>

        {items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
            initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25, delay: index * 0.03 }}
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
            </motion.div>
          ))
        ) : (
          <div className="text-center text-emerald-700">No stock items found</div>
        )}
      </motion.div>
    </motion.div>
  );
}