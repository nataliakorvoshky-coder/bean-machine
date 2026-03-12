"use client"

import { useState, useRef, useEffect } from "react"

type Props = {
  value:string
  onChange:(value:string)=>void
}

export default function StyledDatePicker({ value, onChange }:Props){

  const [open,setOpen] = useState(false)
  const [date,setDate] = useState(new Date())

  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{

    function handleClickOutside(e:MouseEvent){

      if(ref.current && !ref.current.contains(e.target as Node)){
        setOpen(false)
      }

    }

    document.addEventListener("mousedown",handleClickOutside)

    return ()=>{
      document.removeEventListener("mousedown",handleClickOutside)
    }

  },[])

  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year,month,1).getDay()
  const daysInMonth = new Date(year,month+1,0).getDate()

  function prevMonth(){
    setDate(new Date(year,month-1,1))
  }

  function nextMonth(){
    setDate(new Date(year,month+1,1))
  }

  function selectDay(day:number){

    const selected = new Date(year,month,day)
    const formatted = selected.toISOString().split("T")[0]

    onChange(formatted)
    setOpen(false)
  }

  const monthName = date.toLocaleString("default",{ month:"long" })

  return(

    <div ref={ref} className="relative w-full">

      {/* INPUT */}

      <input
        readOnly
        value={value || ""}
        placeholder="Select date"
        onClick={()=>setOpen(true)}
        className="
        w-full border border-emerald-300 rounded-lg
        px-3 py-2 text-sm text-gray-700 bg-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500
        cursor-pointer
        "
      />

      {/* CALENDAR */}

      {open &&(

        <div className="
        absolute z-50 mt-2 w-[280px]
        bg-white border border-emerald-200 rounded-xl
        shadow-lg p-4
        ">

          {/* HEADER */}

          <div className="flex justify-between items-center mb-3">

            <button
              onClick={prevMonth}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ‹
            </button>

            <div className="font-semibold text-emerald-700 text-sm">
              {monthName} {year}
            </div>

            <button
              onClick={nextMonth}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ›
            </button>

          </div>

          {/* WEEK DAYS */}

          <div className="grid grid-cols-7 text-[11px] text-gray-500 mb-1">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* DAYS */}

          <div className="grid grid-cols-7 gap-1 text-sm">

            {Array.from({length:firstDay}).map((_,i)=>(
              <div key={"empty"+i}></div>
            ))}

            {Array.from({length:daysInMonth}).map((_,i)=>{

              const day = i+1

              return(

                <button
                  key={day}
                  onClick={()=>selectDay(day)}
                  className="
                  w-8 h-8 rounded
                  hover:bg-emerald-100
                  hover:text-emerald-700
                  "
                >
                  {day}
                </button>

              )

            })}

          </div>

        </div>

      )}

    </div>

  )

}