"use client"

import { useEffect, useState } from "react"

const API = "/api/manager-analytics"

type Manager = {
  id: string
  name: string
  total_actions: number
  approvals: number
  promotions: number
  terminations: number
  requests: number
}

export default function ManagerAnalytics(){

  const [managers,setManagers] = useState<Manager[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    load()
  },[])

  async function load(){
    try{
      const res = await fetch(API)
      const data = await res.json()
      setManagers(data.managers || [])
    }catch(err){
      console.error(err)
    }
    setLoading(false)
  }

  if(loading){
    return(
      <div className="p-10 text-gray-500">
        Loading manager analytics...
      </div>
    )
  }

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Manager Analytics
      </h1>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-10">

        <Card title="Managers" value={managers.length} />
        <Card title="Total Actions" value={sum(managers,"total_actions")} />
        <Card title="Promotions" value={sum(managers,"promotions")} />
        <Card title="Requests Handled" value={sum(managers,"requests")} />

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-6 px-6 py-4 text-sm font-semibold text-emerald-700 border-b">
          <div>Manager</div>
          <div>Total</div>
          <div>Approvals</div>
          <div>Promotions</div>
          <div>Requests</div>
          <div>Terminations</div>
        </div>

        {managers.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No manager data
          </div>
        ) : (
          managers.map(m => (

            <div
              key={m.id}
              className="grid grid-cols-6 px-6 py-3 text-sm border-b items-center"
            >

              <div className="text-emerald-700 font-medium">
                {m.name}
              </div>

              <div>{m.total_actions}</div>
              <div>{m.approvals}</div>
              <div>{m.promotions}</div>
              <div>{m.requests}</div>
              <div>{m.terminations}</div>

            </div>

          ))
        )}

      </div>

    </div>

  )
}

/* 🔧 HELPERS */

function sum(arr:any[], key:string){
  return arr.reduce((s,i)=> s + (i[key] || 0),0)
}

function Card({title,value}:{title:string,value:number}){
  return(
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-bold text-emerald-700">{value}</div>
    </div>
  )
}