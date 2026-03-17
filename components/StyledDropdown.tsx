"use client"

import { useState, useRef, useEffect } from "react"

type Option = {
  id: string
  name: string
}

type Props = {
  placeholder: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  className?: string // Add the className prop here to allow it to be passed in
  width?: string // Optional width prop to set a custom width
}

export default function StyledDropdown({
  placeholder,
  options,
  value,
  onChange,
  className = "", // Default to an empty string if no className is provided
  width = "200px", // Default width set to 200px, can be changed from the parent
}: Props) {

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.id === value)

  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, []) // We don't need to listen for changes to open in the dependency array

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: width }}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full border border-emerald-300 rounded-lg
          px-3 py-2 text-sm text-left bg-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500
          flex justify-between items-center
        "
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {selected?.name || placeholder}
        </span>

        <span className="text-gray-400">▾</span>
      </button>

      {/* MENU */}
      {open && (
        <div
          className="
          absolute z-50 w-full mt-1
          bg-white border border-emerald-200 rounded-lg
          shadow-lg max-h-60 overflow-y-auto
          "
        >
          {options.map(opt => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
              }}
              className="
                px-3 py-2 text-sm cursor-pointer
                text-gray-700
                hover:bg-emerald-50
                hover:text-emerald-700
                transition-colors
              "
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}