"use client"

import { useEffect, useState } from "react"

const API = "/api/inventory"
const ACTIVITY_API = "/api/activity"

export default function AdminDashboard(){

  const [stock,setStock] = useState<any[]>([])
  const [lowStock,setLowStock] = useState<any[]>([])
  const [activity,setActivity] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    try{

      // 📦 STOCK
      const stockRes = await fetch(API,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ action:"getStockItems" })
      })

      const stockData = await stockRes.json()

      // ⚠️ LOW STOCK
      const low = (stockData || []).filter((item:any)=>{
        return (item.current_amount || 0) < (item.goal_amount || 0)
      })

      // 📊 ACTIVITY
      const actRes = await fetch(ACTIVITY_API)
      const actData = await actRes.json()

      setStock(stockData || [])
      setLowStock(low)
      setActivity(actData || [])

    }catch(err){
      console.error(err)
    }

    setLoading(false)
  }

  function totalItems(){
    return stock.length
  }

  function totalLow(){
    return lowStock.length
  }

  function totalUnits(){
    return stock.reduce((sum,item)=>{
      return sum + (item.current_amount || 0)
    },0)
  }

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading dashboard...
      </div>
    )
  }

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Application Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold text-emerald-700">
            {totalItems()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Low Stock Items</div>
          <div className="text-2xl font-bold text-red-500">
            {totalLow()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Total Units</div>
          <div className="text-2xl font-bold text-emerald-700">
            {totalUnits()}
          </div>
        </div>

      </div>

      {/* LOW STOCK */}
      <div className="bg-white rounded-xl shadow mb-10">

        <div className="px-6 py-4 border-b text-emerald-700 font-semibold">
          Low Stock Alerts
        </div>

        {lowStock.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            All items are stocked
          </div>
        ) : (
          lowStock.slice(0,5).map(item => (
            <div
              key={item.id}
              className="flex justify-between px-6 py-3 border-b text-sm"
            >
              <div className="text-emerald-700 font-medium">
                {item.name}
              </div>
              <div className="text-red-500">
                {item.current_amount} / {item.goal_amount}
              </div>
            </div>
          ))
        )}

      </div>

      {/* ACTIVITY */}
      <div className="bg-white rounded-xl shadow">

        <div className="px-6 py-4 border-b text-emerald-700 font-semibold">
          Recent Activity
        </div>

        {activity.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No activity yet
          </div>
        ) : (
          activity.slice(0,5).map(item => (
            <div
              key={item.id}
              className="px-6 py-3 border-b text-sm"
            >
              <div className="text-emerald-700 font-medium">
                {item.action}
              </div>
              <div className="text-gray-500 text-xs">
                {item.description}
              </div>
            </div>
          ))
        )}

      </div>

    </div>

  )

}