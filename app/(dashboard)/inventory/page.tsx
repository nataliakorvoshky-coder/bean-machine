"use client"

import { useEffect, useState } from "react"

const SECTIONS = [
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

export default function InventoryPage() {

  const [items, setItems] = useState<StockItem[]>([])

  async function load() {

    try {

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getStockItems"
        })
      })

      const data = await res.json()

      if (Array.isArray(data)) {
        setItems(data)
      } else {
        console.error("Inventory API returned invalid data:", data)
        setItems([])
      }

    } catch (err) {

      console.error("Inventory load error:", err)
      setItems([])

    }

  }

useEffect(() => {

  load()

  // 🔥 LISTEN FOR RESTOCK UPDATES
  const handle = (e: StorageEvent) => {
    if (e.key === "inventory_refresh") {
      load()
    }
  }

  window.addEventListener("storage", handle)

  return () => {
    window.removeEventListener("storage", handle)
  }

}, [])

  function status(current: number, goal: number) {

    if (current < goal)
      return { text: "Low", bg: "bg-red-100 text-red-600" }

    if (current === goal)
      return { text: "Met", bg: "bg-emerald-100 text-emerald-700" }

    return { text: "Over", bg: "bg-blue-100 text-blue-600" }

  }

  function renderSection(section: string) {

    const list = Array.isArray(items)
      ? items.filter(
          i => i.section?.trim().toLowerCase() === section.toLowerCase()
        )
      : []

    return (

      <div key={section} className="bg-white p-4 rounded-xl shadow mb-5">

        <h2 className="text-lg font-semibold text-emerald-700 mb-3">
          {section}
        </h2>

        <div className="grid grid-cols-4 text-xs font-semibold text-emerald-700 border-b pb-2">
          <div>Item</div>
          <div className="text-right">Current</div>
          <div className="text-right">Goal</div>
          <div className="text-right">Status</div>
        </div>

        {list.map(item => {

          const percent =
            item.goal_amount > 0
              ? Math.min((item.current_amount / item.goal_amount) * 100, 100)
              : 0

          const s = status(item.current_amount, item.goal_amount)

          return (

            <div
              key={item.id}
              className="grid grid-cols-4 py-2 border-b border-emerald-100 items-center"
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

              <div className="text-right text-emerald-700 text-sm">
                {item.current_amount.toLocaleString()}
              </div>

              <div className="text-right text-emerald-700 text-sm">
                {item.goal_amount.toLocaleString()}
              </div>

              <div className="text-right">

                <span
                  className={
                    "px-2 py-[2px] rounded-full text-[11px] font-medium " + s.bg
                  }
                >
                  {s.text}
                </span>

              </div>

            </div>

          )

        })}

      </div>

    )

  }

  return (

    <div className="max-w-[1100px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Stock Overview
      </h1>

      {SECTIONS.map(renderSection)}

    </div>

  )

}