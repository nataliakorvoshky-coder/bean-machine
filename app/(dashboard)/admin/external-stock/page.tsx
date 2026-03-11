"use client"; // Mark this as a client component

import { useState, useEffect } from "react";

// API URLs
const externalStockApi = "/api/external-stock"; // Adjust path based on actual API route
const stockItemsApi = "/api/stock-items"; // Correct API path for Stock Items

export default function ExternalStockPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState<any[]>([]); // External stock items
  const [stockItems, setStockItems] = useState<any[]>([]); // Stock items from Stock Items page
  const [selectedExternalStock, setSelectedExternalStock] = useState<string>("");
  const [selectedStockItem, setSelectedStockItem] = useState<string>("");
  const [quantity, setQuantity] = useState(0);

  // Fetch external stock items when the component mounts
  useEffect(() => {
    async function fetchExternalStockItems() {
      try {
        const res = await fetch(externalStockApi);
        const data = await res.json();
        setItems(data); // Set external stock items
      } catch (error) {
        console.error("Error fetching external stock items:", error);
      }
    }

    async function fetchStockItems() {
      try {
        const res = await fetch(stockItemsApi);
        const data = await res.json();
        setStockItems(data); // Set stock items
      } catch (error) {
        console.error("Error fetching stock items:", error);
      }
    }

    fetchExternalStockItems();
    fetchStockItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the form submission for adding new external stock items
    const res = await fetch(externalStockApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price }),
    });

    const result = await res.json();
    if (result.message) {
      alert(result.message);
    }

    setName("");
    setPrice(0);
  };

  const handleConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the conversion of external stock to stock items
    const res = await fetch("/api/convert-external-to-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        externalStockId: selectedExternalStock,
        stockItemId: selectedStockItem,
        quantity,
      }),
    });

    const result = await res.json();
    if (result.message) {
      alert(result.message);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">External Stock Management</h1>

      {/* External Stock Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-emerald-700 text-xs mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-emerald-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            />
          </div>

          <div>
            <label className="block text-emerald-700 text-xs mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border border-emerald-300 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-emerald-500 w-16"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 text-xs"
          >
            Add Item
          </button>
        </div>
      </form>

      {/* External Stock to Stock Conversion Section */}
      <div className="bg-white rounded-xl shadow p-3 mb-6">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3">Convert External Stock to Stock Items</h2>

        <form onSubmit={handleConversion}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-700 text-xs mb-1">Select External Stock Item</label>
              <select
                value={selectedExternalStock}
                onChange={(e) => setSelectedExternalStock(e.target.value)}
                className="border border-emerald-300 rounded-lg px-3 py-1 text-xs w-full"
              >
                <option value="">Select External Stock Item</option>
                {items.length > 0 ? (
                  items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option value="">No External Stock Items Available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-emerald-700 text-xs mb-1">Select Stock Item</label>
              <select
                value={selectedStockItem}
                onChange={(e) => setSelectedStockItem(e.target.value)}
                className="border border-emerald-300 rounded-lg px-3 py-1 text-xs w-full"
              >
                <option value="">Select Stock Item</option>
                {stockItems.length > 0 ? (
                  stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Stock Items Available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-emerald-700 text-xs mb-1">External Stock Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-emerald-300 rounded-lg px-3 py-1 text-xs w-full"
              />
            </div>

            <div>
              <label className="block text-emerald-700 text-xs mb-1">Stock Item Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-emerald-300 rounded-lg px-3 py-1 text-xs w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 text-xs"
            >
              Convert
            </button>
          </div>
        </form>
      </div>

      {/* Conversion History Section */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold text-emerald-700 mb-4">Conversion History</h2>
        <div className="grid grid-cols-[3fr_1fr_3fr_1fr] text-emerald-700 border-b border-emerald-400 pb-2 mb-2 text-xs">
          <div>External Stock Item</div>
          <div>Amount</div>
          <div>Stock Item</div>
          <div>Amount</div>
        </div>

        {/* Map through conversion data here */}
      </div>
    </div>
  );
}