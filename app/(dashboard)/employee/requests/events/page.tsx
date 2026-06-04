"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"
import StyledDropdown from "@/components/StyledDropdown"
import StyledDatePicker from "@/components/StyledDatePicker"

const eventTypes = [

  {
    id: "Store Event",
    name: "Store Event",
  },

  {
    id: "Community Event",
    name: "Community Event",
  },

  {
    id: "Employee Event",
    name: "Employee Event",
  },

  {
    id: "Vendor Event",
    name: "Vendor Event",
  },

  {
    id: "Holiday Event",
    name: "Holiday Event",
  },

  {
    id: "Other",
    name: "Other",
  },
]

const priorityOptions = [

  {
    id: "Low",
    name: "Low",
  },

  {
    id: "Normal",
    name: "Normal",
  },

  {
    id: "High",
    name: "High",
  },
]

export default function EventRequestPage() {

  const [loading, setLoading] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [form, setForm] = useState({

    event_type: "",

    priority: "",

    subject: "",

    description: "",

    proposed_date: "",

    estimated_attendance: "",

    supplies_needed: "",

    staffing_needed: "",

    budget_estimate: "",

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

          `event-photos/${
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

          `event-videos/${
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
            "event_requests"
          )

          .insert({

            employee_id:
              employeeData?.id,

            employee_name:
              employeeData?.name,

            event_type:
              form.event_type,

            priority:
              form.priority,

            subject:
              form.subject,

            description:
              form.description,

            proposed_date:
              form.proposed_date,

            estimated_attendance:
              form.estimated_attendance,

            supplies_needed:
              form.supplies_needed,

            staffing_needed:
              form.staffing_needed,

            budget_estimate:
              form.budget_estimate,

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
      `Submitted event request: ${form.subject}`,

    type:
      "event_request",

    userId:
      user.id,

    username:
      profile?.username,

    employeeName:
      employeeData?.name,

    details: [

      {
        name:
          "Event Type",

        amount:
          form.event_type,
      },

      {
        name:
          "Priority",

        amount:
          form.priority,
      },

      {
        name:
          "Attendance",

        amount:
          form.estimated_attendance,
      },

      {
        name:
          "Budget",

        amount:
          form.budget_estimate,
      },

      {
        name:
          "Date",

        amount:
          form.proposed_date,
      },
    ],
  }),
})

      setSubmitted(true)

      setForm({

        event_type: "",

        priority: "",

        subject: "",

        description: "",

        proposed_date: "",

        estimated_attendance: "",

        supplies_needed: "",

        staffing_needed: "",

        budget_estimate: "",

        photo: null,

        video: null,
      })

    } catch (err) {

      console.error(err)

      alert(
        "Failed to submit event request"
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
          Event Request
        </h1>

        <p
          className="
            text-emerald-600
            text-sm
          "
        >
          Submit event proposals,
          promotions, community
          events, or workplace
          activities.
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
          Event request submitted
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
              Event Type
            </div>

            <StyledDropdown

              placeholder="
                Select event type
              "

              options={
                eventTypes
              }

              value={
                form.event_type
              }

              onChange={(value) =>

                setForm({

                  ...form,

                  event_type:
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
              Priority
            </div>

            <StyledDropdown

              placeholder="
                Select priority
              "

              options={
                priorityOptions
              }

              value={
                form.priority
              }

              onChange={(value) =>

                setForm({

                  ...form,

                  priority:
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
              Proposed Date
            </div>

            <StyledDatePicker

              value={
                form.proposed_date
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  proposed_date:
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
            Event Title
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
              Event name or summary
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
            Event Description
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
              Describe the event
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
              Estimated Attendance
            </div>

            <input

              type="number"

              value={
                form.estimated_attendance
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  estimated_attendance:
                    e.target.value,
                })
              }

              placeholder="
                Estimated people
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
              Staffing Needed
            </div>

            <input

              type="text"

              value={
                form.staffing_needed
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  staffing_needed:
                    e.target.value,
                })
              }

              placeholder="
                Employees/staff needed
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
              Budget Estimate
            </div>

            <input

              type="text"

              value={
                form.budget_estimate
              }

              onChange={(e) =>

                setForm({

                  ...form,

                  budget_estimate:
                    e.target.value,
                })
              }

              placeholder="
                Estimated cost
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
            Supplies Needed
          </div>

          <textarea

            rows={3}

            value={
              form.supplies_needed
            }

            onChange={(e) =>

              setForm({

                ...form,

                supplies_needed:
                  e.target.value,
              })
            }

            placeholder="
              List supplies,
              materials, or setup needs
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
              : "Submit Event"}

          </button>

        </div>

      </form>

    </div>
  )
}