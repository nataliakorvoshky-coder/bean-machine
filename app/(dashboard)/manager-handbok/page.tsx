"use client"

import { useState } from "react"

const sections = [
  {
    id: "leadership",
    title: "Leadership Expectations",
    content: `
Managers are expected to lead by example, maintain professionalism, and support their team.

You are responsible for setting the tone, resolving conflicts, and ensuring a productive work environment.
    `
  },
  {
    id: "staff-management",
    title: "Staff Management",
    content: `
Managers must oversee scheduling, attendance, and employee performance.

Ensure all staff are properly trained and following company policies.
    `
  },
  {
    id: "inventory",
    title: "Inventory Responsibility",
    content: `
Managers are responsible for monitoring stock levels and ensuring timely restocking.

Discrepancies must be reported and investigated immediately.
    `
  },
  {
    id: "reporting",
    title: "Reporting & Accountability",
    content: `
Managers must maintain accurate records of hours, inventory, and operations.

Failure to report accurately may result in disciplinary action.
    `
  },
  {
    id: "discipline",
    title: "Disciplinary Procedures",
    content: `
Managers are responsible for enforcing company rules.

All disciplinary actions must be documented and handled fairly.
    `
  },
  {
    id: "communication",
    title: "Communication",
    content: `
Maintain clear communication between staff and upper management.

Escalate issues when necessary and ensure team alignment.
    `
  }
]

export default function ManagerHandbookPage(){

  const [active,setActive] = useState(sections[0])

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Manager Handbook
      </h1>

      <div className="flex gap-6">

        {/* SIDEBAR */}
        <div className="w-[260px] bg-white rounded-xl shadow p-4 h-fit">

          {sections.map(section => (

            <div
              key={section.id}
              onClick={()=>setActive(section)}
              className={`cursor-pointer px-3 py-2 rounded mb-2 text-sm ${
                active.id === section.id
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {section.title}
            </div>

          ))}

        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
            {active.title}
          </h2>

          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {active.content}
          </p>

        </div>

      </div>

    </div>

  )

}