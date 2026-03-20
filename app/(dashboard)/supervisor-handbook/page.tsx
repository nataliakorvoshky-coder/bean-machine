"use client"

import { useState } from "react"

const sections = [
  {
    id: "role",
    title: "Supervisor Role",
    content: `
Supervisors are responsible for overseeing daily operations and ensuring tasks are completed efficiently.

You act as the bridge between employees and management.
    `
  },
  {
    id: "team-oversight",
    title: "Team Oversight",
    content: `
Monitor employee performance, attendance, and productivity.

Ensure all staff follow company policies and procedures.
    `
  },
  {
    id: "task-management",
    title: "Task Management",
    content: `
Assign tasks clearly and ensure they are completed on time.

Prioritize work based on business needs.
    `
  },
  {
    id: "reporting",
    title: "Reporting Issues",
    content: `
Report any issues, delays, or concerns to management immediately.

Accurate reporting ensures smooth operations.
    `
  },
  {
    id: "inventory",
    title: "Inventory Awareness",
    content: `
Supervisors must monitor stock levels during shifts.

Notify management when stock is low or discrepancies occur.
    `
  },
  {
    id: "conduct",
    title: "Professional Conduct",
    content: `
Maintain professionalism at all times.

Lead by example and ensure a respectful work environment.
    `
  }
]

export default function SupervisorHandbookPage(){

  const [active,setActive] = useState(sections[0])

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Supervisor Handbook
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