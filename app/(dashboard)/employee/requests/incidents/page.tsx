"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"
import StyledDropdown from "@/components/StyledDropdown"
import StyledDatePicker from "@/components/StyledDatePicker"

const incidentTypes = [


  {
    id: "Customer Incident",
    name: "Customer Incident",
  },

  {
    id: "Property Damage",
    name: "Property Damage",
  },

  {
    id: "Equipment Failure",
    name: "Equipment Failure",
  },

  {
    id: "Panic Button",
    name: "Panic Button",
  },

   {
    id: "Called 911",
    name: "Called 911",
  },

  {
    id: "Other",
    name: "Other",
  },
]

const severityOptions = [

  {
    id: "Low",
    name: "Low",
  },

  {
    id: "Medium",
    name: "Medium",
  },

  {
    id: "High",
    name: "High",
  },

  {
    id: "Critical",
    name: "Critical",
  },
]

export default function IncidentRequestPage() {

  const [loading, setLoading] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [form, setForm] = useState({

    incident_type: "",

    severity: "",

    subject: "",

    description: "",

    people_involved: "",

    incident_date: "",

    location: "",

    injuries_reported: "",

    immediate_action_taken: "",

    photo: null as File | null,

video: null as File | null,

  })

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setLoading(true)

    try {

      const {
        data: auth,
      } = await supabase
        .auth
        .getUser()

      const user =
        auth?.user

      if (!user) {

        alert(
          "You must be logged in"
        )

        return
      }

      const {
        data: profile,
      } = await supabase

        .from("profiles")

        .select(`
          username,
          employees (
            id,
            name
          )
        `)

        .eq(
          "id",
          user.id
        )

        .single()

      const employeeData =
        Array.isArray(
          profile?.employees
        )
          ? profile.employees[0]
          : profile?.employees

          let photoUrl = null
let videoUrl = null

/* PHOTO */

if (form.photo) {

  const photoPath =

    `incident-photos/${
      Date.now()
    }-${form.photo.name}`

  const {
    error: photoError
  } = await supabase.storage

    .from("incident-media")

    .upload(
      photoPath,
      form.photo
    )

  if (!photoError) {

    const {
      data
    } = supabase.storage

      .from("incident-media")

      .getPublicUrl(
        photoPath
      )

    photoUrl =
      data.publicUrl
  }
}

/* VIDEO */

if (form.video) {

  const videoPath =

    `incident-videos/${
      Date.now()
    }-${form.video.name}`

  const {
    error: videoError
  } = await supabase.storage

    .from("incident-media")

    .upload(
      videoPath,
      form.video
    )

  if (!videoError) {

    const {
      data
    } = supabase.storage

      .from("incident-media")

      .getPublicUrl(
        videoPath
      )

    videoUrl =
      data.publicUrl
  }
}

      const { error } =
        await supabase

          .from(
            "incident_requests"
          )

          .insert({

employee_id:
  employeeData?.id,

employee_name:
  employeeData?.name,

            incident_type:
              form.incident_type,

            severity:
              form.severity,

            subject:
              form.subject,

            description:
              form.description,

            people_involved:
              form.people_involved,

            incident_date:
              form.incident_date,

            location:
              form.location,

            injuries_reported:
              form.injuries_reported,

            immediate_action_taken:
              form.immediate_action_taken,

              photo_url:
  photoUrl,

video_url:
  videoUrl,

            status:
              "Pending",
          })

      if (error) {

        console.error(error)

        alert(error.message)

        return
      }

      /* ACTIVITY LOG */

await fetch("/api/activity", {

  method: "POST",

  headers: {
    "Content-Type":
      "application/json",
  },

  body: JSON.stringify({

    action:
      `Submitted incident: ${form.subject}`,

    type:
      "incident_report",

    userId:
      user.id,

    username:
      profile?.username,

    employeeName:
      employeeData?.name,

    details: [

      {
        name:
          "Incident Type",

        amount:
          form.incident_type,
      },

      {
        name:
          "Severity",

        amount:
          form.severity,
      },

      {
        name:
          "Location",

        amount:
          form.location,
      },

      {
        name:
          "People Involved",

        amount:
          form.people_involved,
      },

      {
        name:
          "Incident Date",

        amount:
          form.incident_date,
      },
    ],
  }),
})

      setSubmitted(true)

      setForm({

        incident_type: "",

        severity: "",

        subject: "",

        description: "",

        people_involved: "",

        incident_date: "",

        location: "",

        injuries_reported: "",

        immediate_action_taken: "",

        photo: null,

video: null,

      })

    } catch (err) {

      console.error(err)

      alert(
        "Failed to submit incident"
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div
      className="
        max-w-5xl
        mx-auto
        py-10
        px-4
      "
    >

      <div className="mb-8">

        <h1
          className="
            text-3xl
            font-bold
            text-emerald-700
            mb-2
          "
        >
          Incident Report
        </h1>

        <p
          className="
            text-emerald-600
            text-sm
          "
        >
          Report workplace incidents,
          accidents, safety issues,
          or emergencies.
        </p>

      </div>

      {submitted && (

        <div
          className="
            mb-6
            bg-emerald-100
            border
            border-emerald-200
            text-emerald-700
            rounded-xl
            px-4
            py-3
            text-sm
          "
        >
          Incident submitted
          successfully.
        </div>
      )}

      <form

        onSubmit={handleSubmit}

        className="
          bg-white
          rounded-2xl
          border
          border-emerald-100
          shadow
          p-5
          space-y-5
        "
      >

        <div
          className="
            grid
            md:grid-cols-3
            gap-5
          "
        >

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Incident Type
            </div>

            <StyledDropdown

              placeholder="
                Select incident type
              "

              options={
                incidentTypes
              }

              value={
                form.incident_type
              }

              onChange={(value) =>

                setForm({

                  ...form,

                  incident_type:
                    value,
                })
              }

              width="100%"
            />

          </div>

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Severity
            </div>

            <StyledDropdown

              placeholder="
                Select severity
              "

              options={
                severityOptions
              }

              value={
                form.severity
              }

              onChange={(value) =>

                setForm({

                  ...form,

                  severity:
                    value,
                })
              }

              width="100%"
            />

          </div>

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Incident Date
            </div>

            <StyledDatePicker

              value={
                form.incident_date
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  incident_date:
                    value,
                })
              }
            />

          </div>

        </div>

        <div>

          <div
            className="
              text-sm
              font-semibold
              text-emerald-700
              mb-2
            "
          >
            Subject
          </div>

          <input

            type="text"

            value={form.subject}

            onChange={(e) =>

              setForm({

                ...form,

                subject:
                  e.target.value,
              })
            }

            placeholder="
              Brief summary
            "

            className="
              w-full
              rounded-xl
              border
              border-emerald-200
              bg-white
              px-4
              py-3
              text-emerald-700
              outline-none

              focus:border-emerald-500

              focus:ring-2
              focus:ring-emerald-200
            "
          />

        </div>

        <div
          className="
            grid
            md:grid-cols-2
            gap-5
          "
        >

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              People Involved
            </div>

            <input

              type="text"

              value={
                form.people_involved
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  people_involved:
                    e.target.value,
                })
              }

              placeholder="
                Employees/customers involved
              "

              className="
                w-full
                rounded-xl
                border
                border-emerald-200
                bg-white
                px-4
                py-3
                text-emerald-700
                outline-none

                focus:border-emerald-500

                focus:ring-2
                focus:ring-emerald-200
              "
            />

          </div>

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Location
            </div>

            <input

              type="text"

              value={
                form.location
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  location:
                    e.target.value,
                })
              }

              placeholder="
                Where did this occur?
              "

              className="
                w-full
                rounded-xl
                border
                border-emerald-200
                bg-white
                px-4
                py-3
                text-emerald-700
                outline-none

                focus:border-emerald-500

                focus:ring-2
                focus:ring-emerald-200
              "
            />

          </div>

        </div>

        <div>

          <div
            className="
              text-sm
              font-semibold
              text-emerald-700
              mb-2
            "
          >
            Full Description
          </div>

          <textarea

            rows={4}

            value={
              form.description
            }

            onChange={(e) =>

              setForm({

                ...form,

                description:
                  e.target.value,
              })
            }

            placeholder="
              Describe the incident
              in detail
            "

            className="
              w-full
              rounded-xl
              border
              border-emerald-200
              bg-white
              px-4
              py-3
              text-emerald-700
              outline-none
              resize-none

              focus:border-emerald-500

              focus:ring-2
              focus:ring-emerald-200
            "
          />

        </div>

        <div
          className="
            grid
            md:grid-cols-2
            gap-5
          "
        >

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Injuries Reported
            </div>

            <textarea

              rows={3}

              value={
                form.injuries_reported
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  injuries_reported:
                    e.target.value,
                })
              }

              placeholder="
                Describe any injuries
              "

              className="
                w-full
                rounded-xl
                border
                border-emerald-200
                bg-white
                px-4
                py-3
                text-emerald-700
                outline-none
                resize-none

                focus:border-emerald-500

                focus:ring-2
                focus:ring-emerald-200
              "
            />

          </div>

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Immediate Action Taken
            </div>

            <textarea

              rows={3}

              value={
                form.immediate_action_taken
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  immediate_action_taken:
                    e.target.value,
                })
              }

              placeholder="
                Describe actions taken
              "

              className="
                w-full
                rounded-xl
                border
                border-emerald-200
                bg-white
                px-4
                py-3
                text-emerald-700
                outline-none
                resize-none

                focus:border-emerald-500

                focus:ring-2
                focus:ring-emerald-200
              "
            />

          </div>

        </div>

        <div
  className="
    grid
    md:grid-cols-2
    gap-5
  "
>

  {/* PHOTO */}

  <div>

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
        mb-2
      "
    >
      Upload Photo
    </div>

    <input

      type="file"

      accept="image/*"

      onChange={(e)=>

        setForm({

          ...form,

          photo:
            e.target.files?.[0] || null,
        })
      }

      className="
        w-full
        rounded-xl
        border
        border-emerald-200
        bg-white
        px-4
        py-3
        text-sm
        text-emerald-700
      "
    />

  </div>

  {/* VIDEO */}

  <div>

    <div
      className="
        text-sm
        font-semibold
        text-emerald-700
        mb-2
      "
    >
      Upload Video
    </div>

    <input

      type="file"

      accept="video/*"

      onChange={(e)=>

        setForm({

          ...form,

          video:
            e.target.files?.[0] || null,
        })
      }

      className="
        w-full
        rounded-xl
        border
        border-emerald-200
        bg-white
        px-4
        py-3
        text-sm
        text-emerald-700
      "
    />

  </div>

</div>

        <div className="pt-2">

          <button

            type="submit"

            disabled={loading}

            className="
              bg-emerald-600
              hover:bg-emerald-700
              disabled:opacity-50

              text-white
              font-semibold

              rounded-xl

              px-6
              py-3

              shadow
              transition-all
            "
          >

            {loading
              ? "Submitting..."
              : "Submit Incident"}

          </button>

        </div>

      </form>

    </div>
  )
}