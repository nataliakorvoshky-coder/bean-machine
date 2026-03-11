"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// Define sections and types
const SECTIONS: string[] = [
  "Oven Fridge",
  "Coffee Fridge",
  "Prep Fridge",
  "Display Case"
]

type StockItem = {
  id: string
  name: string
  section: string
  current_amount: number
  goal_amount: number
}

type Conversion = {
  id: string
  stockItemId: string
  purchasedItemName: string
  unitsPerPurchase: number
  price: number
  conversionAmount: number
}

export default function StockConversionPage(): React.ReactNode {
  const [items, setItems] = useState<StockItem[]>([])
  const [stockItemId, setStockItemId] = useState("")
  const [purchasedItemName, setPurchasedItemName] = useState("")
  const [unitsPerPurchase, setUnitsPerPurchase] = useState(0)
  const [price, setPrice] = useState(0)
  const [conversionAmount, setConversionAmount] = useState(0)
  const [conversions, setConversions] = useState<Conversion[]>([])

  // Load stock items from Supabase
  async function loadItems() {
    const { data, error } = await supabase
      .from("stock_items")
      .select("*")
      .order("name")
    
    if (error) {
      console.error(error)
    } else {
      setItems(data as StockItem[])
    }
  }

  // Load conversions from Supabase
  async function loadConversions() {
    const { data, error } = await supabase
      .from("stock_conversions")
      .select("*")

    if (error) {
      console.error(error)
    } else {
      setConversions(data as Conversion[])  // Type casting to ensure it's recognized as Conversion[]
    }
  }

  // Load items and conversions on component mount
  useEffect(() => {
    loadItems()
    loadConversions()

    const channel = supabase
      .channel("stock_conversions_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_conversions" }, loadConversions)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Add conversion to stock_conversions table
  async function addConversion() {
    if (!stockItemId || !purchasedItemName || unitsPerPurchase <= 0 || price <= 0 || conversionAmount <= 0) return

    const { data, error } = await supabase
      .from("stock_conversions")
      .insert([{
        stock_item_id: stockItemId,
        purchased_item_name: purchasedItemName,
        units_per_purchase: unitsPerPurchase,
        price: price,
        conversion_amount: conversionAmount
      }])

    if (error) {
      console.error(error)
    } else {
      // Ensure data exists before updating state
      if (data && data.length > 0) {
        setConversions([
          ...conversions,
          {
            id: data[0].id, // Access id from the returned data safely
            stockItemId,
            purchasedItemName,
            unitsPerPurchase,
            price,
            conversionAmount
          }
        ])
      }
    }

    // Reset form and reload items
    setStockItemId("")
    setPurchasedItemName("")
    setUnitsPerPurchase(0)
    setPrice(0)
    setConversionAmount(0)
  }

  // Handle deletion of conversion
  const deleteConversion = async (id: string) => {
    const { error } = await supabase
      .from("stock_conversions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      // Remove conversion from local state after successful delete
      setConversions(conversions.filter(conversion => conversion.id !== id))
    }
  }

  // Render Stock Conversion Page
  return (
    <div className="max-w-[900px] mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Item Conversion
      </h1>

      {/* Input Fields for Conversion */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-700 text-sm">Stock Item</label>
            <select
              value={stockItemId}
              onChange={(e) => setStockItemId(e.target.value)}
              className="border border-emerald-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            >
              <option value="">Select Stock Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-emerald-700 text-sm">Purchased/Prepped Item</label>
            <input
              type="text"
              value={purchasedItemName}
              onChange={(e) => setPurchasedItemName(e.target.value)}
              className="border border-emerald-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
              placeholder="Enter Purchased/Prepped Item"
            />
          </div>

          <div>
            <label className="block text-emerald-700 text-sm">Units per Purchase</label>
            <input
              type="number"
              value={unitsPerPurchase}
              onChange={(e) => setUnitsPerPurchase(Number(e.target.value))}
              className="border border-emerald-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            />
          </div>

          <div>
            <label className="block text-emerald-700 text-sm">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border border-emerald-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            />
          </div>

          <div>
            <label className="block text-emerald-700 text-sm">Conversion Amount</label>
            <input
              type="number"
              value={conversionAmount}
              onChange={(e) => setConversionAmount(Number(e.target.value))}
              className="border border-emerald-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={addConversion}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Add Conversion
          </button>
        </div>
      </div>

      {/* Conversion Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-emerald-700 mb-4">Conversions</h2>
        <div className="grid grid-cols-6 font-semibold text-emerald-700 border-b pb-2 text-xs">
          <div>Stock Item</div>
          <div>Purchased/Prepped Item</div>
          <div>Units per Purchase</div>
          <div>Price</div>
          <div>Conversion Amount</div>
          <div>Action</div>
        </div>

        {conversions.map((conversion) => (
          <div
            key={conversion.id}
            className="grid grid-cols-6 py-2 border-b border-emerald-100 items-center text-sm"
          >
            <div>{conversion.stockItemId}</div>
            <div>{conversion.purchasedItemName}</div>
            <div>{conversion.unitsPerPurchase}</div>
            <div>{conversion.price}</div>
            <div>{conversion.conversionAmount}</div>
            <div>
              <button
                onClick={() => deleteConversion(conversion.id)}
                className="text-red-500 hover:underline text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}