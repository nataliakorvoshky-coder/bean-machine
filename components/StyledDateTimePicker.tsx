"use client"

import { useState, useRef, useEffect } from "react"

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function StyledDateTimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState("12:00")

  const [openHour, setOpenHour] = useState(false)
  const [openMinute, setOpenMinute] = useState(false)
  const [openPeriod, setOpenPeriod] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setOpenHour(false)
        setOpenMinute(false)
        setOpenPeriod(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // INIT FROM VALUE
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      setDate(d)

      const hh = String(d.getHours()).padStart(2, "0")
      const mm = String(d.getMinutes()).padStart(2, "0")
      setTime(`${hh}:${mm}`)
    }
  }, [value])

  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    setDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setDate(new Date(year, month + 1, 1))
  }

  function updateValue(d: Date) {
    const formatted =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")

    onChange(formatted)
  }

  function selectDay(day: number) {
    const selected = new Date(year, month, day)

    const [h, m] = time.split(":").map(Number)
    selected.setHours(h)
    selected.setMinutes(m)

    updateValue(selected)
    setDate(selected)
    setOpen(false)
  }

  function handleTimeChange(t: string) {
    setTime(t)

    const updated = new Date(date)
    const [h, m] = t.split(":").map(Number)

    updated.setHours(h)
    updated.setMinutes(m)

    updateValue(updated)
  }

  const hour24 = parseInt(time.split(":")[0])
  const minute = time.split(":")[1]
  const displayHour = hour24 % 12 || 12
  const period = hour24 >= 12 ? "PM" : "AM"

  function setHour(val: number) {
    let h = val
    if (period === "PM" && h !== 12) h += 12
    if (period === "AM" && h === 12) h = 0

    handleTimeChange(`${String(h).padStart(2, "0")}:${minute}`)
  }

  function setMinute(val: string) {
    handleTimeChange(`${String(hour24).padStart(2, "0")}:${val}`)
  }

  function setPeriod(val: string) {
    let h = hour24
    if (val === "PM" && h < 12) h += 12
    if (val === "AM" && h >= 12) h -= 12

    handleTimeChange(`${String(h).padStart(2, "0")}:${minute}`)
  }

  const monthName = date.toLocaleString("default", { month: "long" })

  return (
    <div ref={ref} className="relative w-full">

      {/* INPUT */}
      <input
        readOnly
        value={value ? new Date(value).toLocaleString() : ""}
        placeholder="Select date & time"
        onClick={() => setOpen(true)}
        className="
  w-full border border-emerald-300 rounded-lg
  px-3 py-2 text-sm bg-white cursor-pointer

  outline-none
  focus:outline-none
  focus:ring-2 focus:ring-emerald-400
  focus:border-emerald-400
"
      />

      {/* PANEL */}
      {open && (
        <div className="absolute z-[9999] mt-2 w-[320px] bg-white border border-emerald-200 rounded-xl shadow-lg p-4 space-y-4">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <button onClick={prevMonth}>‹</button>
            <div className="font-semibold text-emerald-700 text-sm">
              {monthName} {year}
            </div>
            <button onClick={nextMonth}>›</button>
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i}></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className="w-8 h-8 rounded hover:bg-emerald-100"
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* TIME PICKER */}
          <div className="border-t pt-2">

            <div className="flex gap-2">

              {/* HOUR */}
              <Dropdown
                value={displayHour}
                open={openHour}
                setOpen={setOpenHour}
                options={Array.from({ length: 12 }, (_, i) => i + 1)}
                onSelect={setHour}
              />

              :

              {/* MINUTES */}
              <Dropdown
                value={minute}
                open={openMinute}
                setOpen={setOpenMinute}
                options={["00", "15", "30", "45"]}
                onSelect={setMinute}
              />

              {/* AM/PM */}
              <Dropdown
                value={period}
                open={openPeriod}
                setOpen={setOpenPeriod}
                options={["AM", "PM"]}
                onSelect={setPeriod}
              />

            </div>

          </div>

        </div>
      )}
    </div>
  )
}

/* 🔥 CUSTOM DROPDOWN */
function Dropdown({ value, open, setOpen, options, onSelect }: any) {
  return (
    <div className="relative w-[60px]">

      <button
        onClick={() => setOpen(!open)}
        className="
  w-full
  border border-emerald-400
  rounded-md px-2 py-1 bg-white text-left
  focus:ring-2 focus:ring-emerald-400
"
      >
        {value}
      </button>

      {open && (
        <div className="
  absolute bottom-full mb-1 w-full max-h-40 overflow-y-auto
  bg-white border border-emerald-200 rounded-md shadow
  z-[9999]
  scrollbar-hide
"
>

          {options.map((opt: any) => (
            <div
              key={opt}
              onClick={() => {
                onSelect(opt)
                setOpen(false)
              }}
              className="px-2 py-1 hover:bg-emerald-100 cursor-pointer"
            >
              {opt}
            </div>
          ))}

        </div>
      )}
    </div>
  )
}