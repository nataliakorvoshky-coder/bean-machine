"use client"

import { useState } from "react"

const sections = [
  {
    id: "conduct",
    title: "Code of Conduct",
    content: `
All employees are expected to maintain professionalism, respect coworkers, and represent the company positively at all times.

Harassment, discrimination, or inappropriate behavior will not be tolerated.
    `
  },
  {
    id: "attendance",
    title: "Attendance Policy",
    content: `
Employees are expected to arrive on time and complete scheduled shifts.

Repeated lateness or absence may result in disciplinary action.
    `
  },
  {
    id: "hours",
    title: "Work Hours",
    content: `
Work hours are tracked and must be submitted accurately.

Falsifying hours will result in termination.
    `
  },
  {
    id: "safety",
    title: "Workplace Safety",
    content: `
Follow all safety procedures at all times.

Report hazards immediately to management.
    `
  },
  {
    id: "technology",
    title: "Technology Use",
    content: `
Company systems are for business use only.

Unauthorized access or misuse is strictly prohibited.
    `
  },
]

export default function EmployeeHandbookPage(){

  const [active,setActive] = useState(sections[0])

  return(

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        Employee Handbook
      </h1>

      <div className="flex gap-6">

        {/* SIDEBAR */}
        <div className="w-[250px] bg-white rounded-xl shadow p-4 h-fit">

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