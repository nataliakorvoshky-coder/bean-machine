"use client"

import { useEffect, useState } from "react"

const API = "/api/inventory"

type StockItem = {
  id: string
  name: string
  current_amount: number
  goal_amount: number
}

export default function StockAnalytics(){

  const [items,setItems] = useState<StockItem[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    try{

      const res = await fetch(API,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ action:"getStockItems" })
      })

      const data = await res.json()

      setItems(Array.isArray(data) ? data : [])

    }catch(err){
      console.error(err)
      setItems([])
    }

    setLoading(false)
  }

  function percent(current:number,goal:number){
    if(!goal) return 0
    return Math.min((current / goal) * 100,100)
  }

  function totalItems(){
    return items.length
  }

  function lowStock(){
    return items.filter(i => (i.current_amount || 0) < (i.goal_amount || 0))
  }

  function totalUnits(){
    return items.reduce((sum,i)=> sum + (i.current_amount || 0),0)
  }

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading stock analytics...
      </div>
    )
  }

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Stock Analytics
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold text-emerald-700">
            {totalItems()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Low Stock</div>
          <div className="text-2xl font-bold text-red-500">
            {lowStock().length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Total Units</div>
          <div className="text-2xl font-bold text-emerald-700">
            {totalUnits()}
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-5 px-6 py-4 text-sm font-semibold text-emerald-700 border-b">
          <div>Item</div>
          <div>Current</div>
          <div>Goal</div>
          <div>Fill %</div>
          <div>Status</div>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No stock data available
          </div>
        ) : (
          items.map(item => {

            const fill = percent(item.current_amount, item.goal_amount)
            const isLow = item.current_amount < item.goal_amount

            return(

              <div
                key={item.id}
                className="grid grid-cols-5 px-6 py-3 text-sm border-b items-center"
              >

                <div className="text-emerald-700 font-medium">
                  {item.name}
                </div>

                <div>
                  {item.current_amount}
                </div>

                <div>
                  {item.goal_amount}
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full">

                  <div className="w-full bg-gray-200 rounded h-2">

                    <div
                      className={`h-2 rounded ${
                        fill < 50
                          ? "bg-red-500"
                          : fill < 80
                          ? "bg-yellow-400"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${fill}%` }}
                    />

                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {fill.toFixed(0)}%
                  </div>

                </div>

                <div className={`font-semibold ${
                  isLow ? "text-red-500" : "text-emerald-600"
                }`}>
                  {isLow ? "Low" : "OK"}
                </div>

              </div>

            )

          })
        )}

      </div>

    </div>

  )

}