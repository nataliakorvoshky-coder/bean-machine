"use client"

import { useState, useEffect } from "react"
import StyledDropdown from "@/components/StyledDropdown"
import StyledDatePicker from "@/components/StyledDatePicker"

const API = "/api/employees"

export default function CreateEmployeePage(){

  const [name,setName] = useState("")
  const [rank,setRank] = useState("")
  const [hireDate,setHireDate] = useState("")
  const [phone,setPhone] = useState("")
  const [cid,setCid] = useState("")
  const [iban,setIban] = useState("")

  const [ranks,setRanks] = useState<any[]>([])

  useEffect(()=>{
    loadRanks()
  },[])

  async function loadRanks(){

    const res = await fetch("/api/employee-ranks")
    const data = await res.json()

    setRanks(Array.isArray(data) ? data : [])

  }

  async function createEmployee(e:any){

    e.preventDefault()

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        name,
        rank_id:rank,
        hire_date:hireDate,
        phone,
        cid,
        iban
      })
    })

    if(res.ok){

      alert("Employee created")

      setName("")
      setRank("")
      setHireDate("")
      setPhone("")
      setCid("")
      setIban("")

    }else{

      alert("Error creating employee")

    }

  }

  const inputStyle =
  "w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"

  return(

    <div className="max-w-[900px] mx-auto">

      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Create Employee Profile
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <form onSubmit={createEmployee}>

          <div className="grid grid-cols-2 gap-6">

            {/* NAME */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Employee Name
              </label>

              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                className={inputStyle}
              />
            </div>


            {/* RANK */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Rank
              </label>

              <StyledDropdown
                placeholder="Select Rank"
                options={ranks.map(r=>({
                  id:r.id,
                  name:r.rank_name
                }))}
                value={rank}
                onChange={setRank}
              />
            </div>


            {/* HIRE DATE */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Hire Date
              </label>

              <StyledDatePicker
                value={hireDate}
                onChange={setHireDate}
              />
            </div>


            {/* PHONE */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Phone
              </label>

              <input
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
                className={inputStyle}
              />
            </div>


            {/* CID */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                CID
              </label>

              <input
                value={cid}
                onChange={(e)=>setCid(e.target.value)}
                className={inputStyle}
              />
            </div>


            {/* IBAN */}

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                IBAN
              </label>

              <input
                value={iban}
                onChange={(e)=>setIban(e.target.value)}
                className={inputStyle}
              />
            </div>

          </div>


          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            className="
            mt-8 w-full
            bg-emerald-600 text-white
            py-3 rounded-lg
            text-lg font-semibold
            hover:bg-emerald-700
            transition
            "
          >
            Create Employee
          </button>

        </form>

      </div>

    </div>

  )

}