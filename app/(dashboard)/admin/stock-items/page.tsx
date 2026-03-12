"use client"

import { useEffect, useState } from "react"

const API = "/api/inventory"

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

export default function StockItemsPage() {

  const [items, setItems] = useState<StockItem[]>([])

  const [name, setName] = useState("")
  const [section, setSection] = useState(SECTIONS[0])
  const [current, setCurrent] = useState(0)
  const [goal, setGoal] = useState(0)

  async function api(action:string,payload:any={}){

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ action, ...payload })
    })

    return res.json()
  }

  async function load(){

    const data = await api("getStockItems")

    setItems(Array.isArray(data) ? data : [])

  }

  useEffect(()=>{
    load()
  },[])

  async function addItem(){

    if(!name.trim()) return

    await api("addStockItem",{
      name,
      section,
      current_amount:current,
      goal_amount:goal
    })

    setName("")
    setCurrent(0)
    setGoal(0)

    load()

  }

  async function updateCurrent(id:string,value:number){

    await api("updateStockCurrent",{
      id,
      current_amount:value
    })

    load()

  }

  async function updateGoal(id:string,value:number){

    await api("updateStockGoal",{
      id,
      goal_amount:value
    })

    load()

  }

  async function deleteItem(id:string){

    if(!confirm("Delete item?")) return

    await api("deleteStockItem",{ id })

    load()

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
              onChange={(e)=>setName(e.target.value)}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Section
            </label>

            <select
              value={section}
              onChange={(e)=>setSection(e.target.value)}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm text-emerald-700
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SECTIONS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Current
            </label>

            <input
              type="number"
              value={current}
              onChange={(e)=>setCurrent(Number(e.target.value))}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-emerald-700">
              Goal
            </label>

            <input
              type="number"
              value={goal}
              onChange={(e)=>setGoal(Number(e.target.value))}
              className="mt-1 w-full border border-emerald-300 rounded px-2 py-1.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {items.map(item => (

          <div
            key={item.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] py-1.5 border-b border-emerald-100 items-center"
          >

            <div className="text-emerald-700 text-sm">
              {item.name}
            </div>

            <div className="text-center text-emerald-700 text-sm">
              {item.section}
            </div>

            <div className="text-center">

              <input
                type="number"
                value={item.current_amount}
                onChange={(e)=>updateCurrent(item.id,Number(e.target.value))}
                className="w-[70px] border border-emerald-300 rounded text-center text-sm py-0.5
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>

            <div className="text-center">

              <input
                type="number"
                value={item.goal_amount}
                onChange={(e)=>updateGoal(item.id,Number(e.target.value))}
                className="w-[70px] border border-emerald-300 rounded text-center text-sm py-0.5
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>

            <div className="text-right">

              <button
                onClick={()=>deleteItem(item.id)}
                className="text-red-500 text-sm hover:underline"
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