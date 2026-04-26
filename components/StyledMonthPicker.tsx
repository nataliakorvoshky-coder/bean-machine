"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function StyledMonthPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectMonth(index: number) {
    const formatted = `${year}-${String(index + 1).padStart(2, "0")}`;
    onChange(formatted);
    setOpen(false);
  }

  const display = (() => {
    if (!value) return "";

    const [y, m] = value.split("-");
    return `${months[Number(m) - 1]} ${y}`;
  })();

  return (
    <div ref={ref} className="relative w-full">
      {/* INPUT */}
      <input
        readOnly
        value={display}
        placeholder="Select month"
        onClick={() => setOpen(true)}
        className="
          w-full border border-emerald-300 rounded-lg
          px-3 py-2 text-sm text-gray-700 bg-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500
          cursor-pointer
        "
      />

      {/* DROPDOWN */}
      {open && (
        <div
          className="
          absolute z-50 mt-2 w-[260px]
          bg-white border border-emerald-200 rounded-xl
          shadow-lg p-4
        "
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ‹
            </button>

            <div className="font-semibold text-emerald-700 text-sm">
              {year}
            </div>

            <button
              onClick={() => setYear((y) => y + 1)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ›
            </button>
          </div>

          {/* MONTH GRID */}
          <div className="grid grid-cols-4 gap-2">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => selectMonth(i)}
                className="
                  py-2 rounded-md text-sm
                  hover:bg-emerald-100
                  hover:text-emerald-700
                "
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}