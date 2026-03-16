"use client";

import { useState, useEffect } from "react";
import StyledDropdown from "@/components/StyledDropdown";

const API = "/api/inventory";

export default function ExternalStockPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);

  const [items, setItems] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);

  const [selectedExternalStock, setSelectedExternalStock] = useState("");
  const [selectedStockItem, setSelectedStockItem] = useState("");

  const [externalQuantity, setExternalQuantity] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);

  // Fetch initial data when the component mounts
  useEffect(() => {
    loadExternalStock();
    loadStockItems();
    loadConversions();
  }, []);

  // Function to interact with the API
  async function api(action: string, payload: any = {}) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  }

  // Fetch external stock items
  async function loadExternalStock() {
    const data = await api("getExternalStock");
    console.log("External Stock Data:", data); // Log data
    setItems(Array.isArray(data) ? data : []);
  }

  // Fetch stock items
  async function loadStockItems() {
    const data = await api("getStockItems");
    console.log("Stock Items Data:", data); // Log data
    setStockItems(Array.isArray(data) ? data : []);
  }

  // Fetch conversion history
  async function loadConversions() {
    const data = await api("getConversions");
    console.log("Conversion History:", data); // Log data
    setConversionHistory(Array.isArray(data) ? data : []);
  }

  // Add a new external stock item
  async function addExternalStock(e: any) {
    e.preventDefault();
    if (!name) return;

    await api("addExternalStock", { name, price });

    setName("");
    setPrice(0);
    loadExternalStock(); // Refresh the list after adding
  }

  // Convert external stock to stock items
  async function convertStock(e: any) {
    e.preventDefault();

    if (!selectedExternalStock || !selectedStockItem) return;

    await api("createConversion", {
      externalStockId: selectedExternalStock,
      stockItemId: selectedStockItem,
      externalQuantity,
      stockQuantity,
    });

    setExternalQuantity(0);
    setStockQuantity(0);
    loadConversions(); // Refresh the conversion history after converting
  }

  // Delete an external stock item
  async function deleteExternal(id: string) {
    await api("deleteExternalStock", { id });
    loadExternalStock(); // Refresh the list after deleting
  }

  // Delete a conversion
  async function deleteConversion(id: string) {
    await api("deleteConversion", { id });
    loadConversions(); // Refresh the conversion history after deleting
  }

  const inputStyle =
    "w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const selectStyle =
    "w-full appearance-none border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-emerald-700 mb-6">
        External Stock Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* ADD EXTERNAL STOCK */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Add External Stock
            </h2>

            <form onSubmit={addExternalStock}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputStyle}
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={inputStyle}
                />
              </div>

              <button className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
                Add Item
              </button>
            </form>
          </div>

          {/* EXTERNAL STOCK LIST */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              External Stock List
            </h2>

            <div className="grid grid-cols-[5fr_1fr] text-xs text-emerald-700 border-b border-emerald-400 pb-2">
              <div>Item</div>
              <div></div>
            </div>

            {items
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[5fr_1fr] text-xs text-emerald-700 py-2 border-b"
                >
                  <div>{item.name}</div>

                  <div className="text-right">
                    <button
                      onClick={() => deleteExternal(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* CONVERT PANEL */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Convert External Stock
            </h2>

            <form onSubmit={convertStock}>
              <div className="grid grid-cols-2 gap-3">
                {/* EXTERNAL ITEM DROPDOWN */}
                <StyledDropdown
                  placeholder="External Item"
                  options={items
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((i) => ({
                      id: i.id,
                      name: i.name,
                    }))}
                  value={selectedExternalStock}
                  onChange={setSelectedExternalStock}
                />

                {/* STOCK ITEM DROPDOWN */}
                <StyledDropdown
                  placeholder="Stock Item"
                  options={stockItems
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((i) => ({
                      id: i.id,
                      name: i.name,
                    }))}
                  value={selectedStockItem}
                  onChange={setSelectedStockItem}
                />

                {/* QUANTITIES */}
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
              </div>

              <button className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
                Convert
              </button>
            </form>
          </div>

          {/* CONVERSION HISTORY */}
          <div className="bg-white rounded-xl shadow p-4">
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

            {conversionHistory.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[3fr_1fr_3fr_1fr_1fr] text-xs text-emerald-700 py-2 border-b"
              >
                <div>{row.external_stock?.name}</div>
                <div className="text-center">{row.external_quantity}</div>
                <div>{row.stock_item?.name}</div>
                <div className="text-center">{row.stock_quantity}</div>

                <div className="text-right">
                  <button
                    onClick={() => deleteConversion(row.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}