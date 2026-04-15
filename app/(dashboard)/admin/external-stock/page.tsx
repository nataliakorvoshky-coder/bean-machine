"use client";

import { useState, useEffect } from "react";
import StyledDropdown from "@/components/StyledDropdown";
import { motion } from "framer-motion";


const API = "/api/inventory";

export default function ExternalStockPage() {
  const [name, setName] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const allItems = [
  ...items.map(i => ({ id: i.id, name: i.name })),
  ...stockItems.map(i => ({ id: i.id, name: i.name }))
]
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);
  const [itemMap, setItemMap] = useState(new Map<string,string>())

  const [selectedExternalStock, setSelectedExternalStock] = useState("");
  const [selectedStockItem, setSelectedStockItem] = useState("");

  const [externalQuantity, setExternalQuantity] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [conversionType, setConversionType] = useState("purchase");

useEffect(() => {
  async function loadAll() {
    await loadExternalStock();
    await loadStockItems();
    await loadConversions();
  }

  loadAll();
}, []);

useEffect(() => {
  const map = new Map<string,string>();

  stockItems.forEach((i:any) => map.set(i.id, i.name));
  items.forEach((i:any) => map.set(i.id, i.name));

  setItemMap(map);
}, [stockItems, items]);

  async function api(action: string, payload: any = {}) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  }

  async function loadExternalStock() {
    const data = await api("getExternalStock");
    setItems(
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : []
);
  }

async function loadStockItems() {
  const data = await api("getStockItems");
  const stock = Array.isArray(data) ? data : [];

  setStockItems(stock);
} // ✅ CLOSE FUNCTION HERE


async function loadConversions() {
  const res = await fetch("/api/conversions");
  const data = await res.json();
  setConversionHistory(Array.isArray(data) ? data : []);
}

  // ✅ ADD EXTERNAL STOCK (FIXED)
async function addExternalStock(e: any) {
  e.preventDefault();

  if (!name) return;

  const newItem = await api("addExternalStock", { name });

  if (!newItem) return;

  setItems((prev) => [
    {
      id: newItem?.id || crypto.randomUUID(),
      name: newItem?.name || name,
    },
    ...prev,
  ]);

  setName("");

  // ✅ SINGLE reload (correct place)
  loadExternalStock();
}

console.log("SELECTED STOCK ITEM:", selectedStockItem);

  async function convertStock(e: any) {
    e.preventDefault();

    if (!selectedExternalStock || !selectedStockItem) return;

await fetch("/api/conversions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  from_item_id: selectedExternalStock,
  to_item_id: selectedStockItem,
  from_quantity: externalQuantity,
  to_quantity: stockQuantity,
  type: conversionType   // ✅ ADD THIS
}),
});

    setExternalQuantity(0);
    setStockQuantity(0);
    loadConversions();
  }

  async function deleteExternal(id: string) {
    await api("deleteExternalStock", { id });
    loadExternalStock();
  }

  async function deleteConversion(id: string) {
    await api("deleteConversion", { id });
    loadConversions();
  }

  const inputStyle =
    "w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="max-w-[1100px] mx-auto px-4 py-4"
>
      <h1 className="text-2xl font-bold text-emerald-700 mb-6">
        External Stock Management
      </h1>

      <motion.div
  className="grid grid-cols-1 md:grid-cols-2 gap-6"
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  }}
>
        
        {/* LEFT COLUMN */}
<motion.div
  className="space-y-6"
  variants={{
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }}
>
          
          {/* ADD EXTERNAL STOCK */}
          <motion.div
  className="bg-white rounded-xl shadow p-4"
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.35 }}
>
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Add External Stock
            </h2>

            <form onSubmit={addExternalStock}>
              <div className="grid grid-cols-1 gap-3">

                {/* ONLY NAME INPUT */}
                <input
                  type="text"
                  placeholder="Item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputStyle}
                />

              </div>
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
>
                Add Item
             </motion.button>
            </form>
          </motion.div>
        

          {/* EXTERNAL STOCK LIST */}
          <motion.div
  className="bg-white rounded-xl shadow p-4"
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.35 }}
>
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              External Stock List
            </h2>

            <div className="grid grid-cols-[5fr_1fr] text-xs text-emerald-700 border-b border-emerald-400 pb-2">
              <div>Item</div>
              <div></div>
            </div>

{items
  .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
  .map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: i * 0.03 }}
      className="grid grid-cols-[5fr_1fr] text-xs text-emerald-700 py-2 border-b"
    >
                  <div>{item.name}</div>

                  <div className="text-right">
                   <motion.button
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => deleteExternal(item.id)}
  className="text-red-500 hover:text-red-700"
>
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.div
  className="space-y-6"
  variants={{
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }}
>
          
          {/* CONVERT PANEL */}
          <motion.div
  className="bg-white rounded-xl shadow p-4"
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.35 }}
>
<h2 className="text-lg font-semibold text-emerald-700 mb-4">
  Create Conversion
</h2>

            <form onSubmit={convertStock}>
              <div className="grid grid-cols-2 gap-3">

<StyledDropdown
  placeholder="From Item"
  options={allItems}
  value={selectedExternalStock}
  onChange={setSelectedExternalStock}
/>

<StyledDropdown
  placeholder="To Item"
  options={allItems}
  value={selectedStockItem}
  onChange={setSelectedStockItem}
/>

                <input
                  type="number"
                  placeholder="External Qty"
                  value={externalQuantity}
                  onChange={(e) => setExternalQuantity(Number(e.target.value))}
                  className={inputStyle}
                />

                <input
                  type="number"
                  placeholder="Stock Qty"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className={inputStyle}
                />

<StyledDropdown
  placeholder="Conversion Type"
  options={[
    { id: "purchase", name: "Purchase (Buy)" },
    { id: "craft", name: "Craft (Internal)" }
  ]}
  value={conversionType}
  onChange={setConversionType}
/>

              </div>

             <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
>
                Convert
             </motion.button>
            </form>
          </motion.div>
          

          {/* CONVERSION HISTORY */}
          <motion.div
  className="bg-white rounded-xl shadow p-4"
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.35 }}
>
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Conversion History
            </h2>

            <div className="grid grid-cols-[3fr_1fr_3fr_1fr_1fr] text-xs text-emerald-700 border-b border-emerald-400 pb-2">
              <div>External Item</div>
              <div className="text-center">Qty</div>
              <div>Stock Item</div>
              <div className="text-center">Qty</div>
              <div></div>
            </div>

{conversionHistory.map((row, i) => (
  <motion.div
    key={row.id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ delay: i * 0.03 }}
    className="grid grid-cols-[3fr_1fr_3fr_1fr_1fr] text-xs text-emerald-700 py-2 border-b"
  >
<div>{itemMap.get(row.from_item_id) || "Unknown"}</div>
<div className="text-center">{row.from_quantity}</div>
<div className="flex items-center gap-2">
  {itemMap.get(row.to_item_id) || "Unknown"}

  <span
    className={`text-[10px] px-2 py-[2px] rounded ${
      row.type === "craft"
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-700"
    }`}
  >
    {row.type === "craft" ? "Craft" : "Buy"}
  </span>
</div>
<div className="text-center">{row.to_quantity}</div>

                <div className="text-right">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteConversion(row.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
            </motion.div>
         </motion.div>
</motion.div>
        </motion.div>
  );
}