"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/logActivity"
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker"

const complaintTypes = [

  {
    id: "Workplace Conduct",
    name: "Workplace Conduct",
  },

  {
    id: "Harassment",
    name: "Harassment",
  },

  {
    id: "Discrimination",
    name: "Discrimination",
  },

  {
    id: "Management Issue",
    name: "Management Issue",
  },

  {
    id: "Coworker Conflict",
    name: "Coworker Conflict",
  },

  {
    id: "Policy Violation",
    name: "Policy Violation",
  },

  {
    id: "Safety Concern",
    name: "Safety Concern",
  },

  {
    id: "Other",
    name: "Other",
  },
];

const complaintAgainstOptions = [

  {
    id: "Employee",
    name: "Employee",
  },

  {
    id: "Supervisor",
    name: "Supervisor",
  },

  {
    id: "Manager",
    name: "Manager",
  },
];

export default function ComplaintRequestPage() {

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [form, setForm] = useState({

    complaint_type: "",

    complaint_against: "",

    subject: "",

    description: "",

    involved_people: "",

    incident_date: "",

    requested_resolution: "",

    photo: null as File | null,

video: null as File | null,

    anonymous: false,
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    try {

      const {
        data: auth,
      } = await supabase
        .auth
        .getUser();

      const user =
        auth?.user;

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

    `complaint-photos/${
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

    `complaint-videos/${
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
            "complaint_requests"
          )

.insert({

  employee_id:

    form.anonymous

      ? null

      : employeeData?.id,

  employee_name:

    form.anonymous

      ? "Anonymous"

      : employeeData?.name,

  complaint_against:
    form.complaint_against,

  visibility_level:

    form.complaint_against ===
    "Supervisor"

      ? "manager"

      : form.complaint_against ===
        "Manager"

      ? "owner"

      : "supervisor",

  complaint_type:
    form.complaint_type,

  subject:
    form.subject,

  description:
    form.description,

  involved_people:
    form.involved_people,

  incident_date:
    form.incident_date,

  requested_resolution:
    form.requested_resolution,

    photo_url:
  photoUrl,

video_url:
  videoUrl,

  anonymous:
    form.anonymous,

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
      `Submitted complaint: ${form.subject}`,

    type:
      "complaint_request",

    userId:
      user.id,

    username:
      profile?.username,

    employeeName:

      form.anonymous

        ? "Anonymous"

        : employeeData?.name,

    details: [

      {
        name:
          "Complaint Type",

        amount:
          form.complaint_type,
      },

      {
        name:
          "Against",

        amount:
          form.complaint_against,
      },

      {
        name:
          "Subject",

        amount:
          form.subject,
      },
    ],
  }),
})

      setSubmitted(true)

      setForm({

        complaint_type: "",

        complaint_against: "",

        subject: "",

        description: "",

        involved_people: "",

        incident_date: "",

        requested_resolution: "",

        photo: null,

video: null,

        anonymous: false,
      })

    } catch (err) {

      console.error(err)

      alert(
        "Failed to submit complaint"
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
          Complaint Request
        </h1>

        <p
          className="
            text-emerald-600
            text-sm
          "
        >
          Submit workplace
          complaints,
          concerns,
          or policy violations.
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
          Complaint submitted
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
    Complaint Type
  </div>

  <StyledDropdown

    placeholder="
      Select complaint type
    "

    options={
      complaintTypes
    }

    value={
      form.complaint_type
    }

    onChange={(value) =>

      setForm({

        ...form,

        complaint_type:
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
    Complaint About
  </div>

  <StyledDropdown

    placeholder="
      Select role
    "

    options={
      complaintAgainstOptions
    }

    value={
      form.complaint_against
    }

    onChange={(value) =>

      setForm({

        ...form,

        complaint_against:
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
              form.involved_people
            }

            onChange={(e) =>

              setForm({

                ...form,

                involved_people:
                  e.target.value,
              })
            }

            placeholder="
              Names of involved
              employees/managers
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
              Describe the complaint
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

        <div>

          <div
            className="
              text-sm
              font-semibold
              text-emerald-700
              mb-2
            "
          >
            Requested Resolution
          </div>

          <textarea

            rows={3}

            value={
              form.requested_resolution
            }

            onChange={(e) =>

              setForm({

                ...form,

                requested_resolution:
                  e.target.value,
              })
            }

            placeholder="
              Describe requested
              resolution
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

        <label
          className="
            flex
            items-center
            gap-3
            text-sm
            text-emerald-700
          "
        >

          <input

            type="checkbox"

            checked={
              form.anonymous
            }

            onChange={(e) =>

              setForm({

                ...form,

                anonymous:
                  e.target.checked,
              })
            }

            className="
              h-4
              w-4
              accent-emerald-600
            "
          />

          Submit anonymously

        </label>

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
              : "Submit Complaint"}

          </button>

        </div>

      </form>

    </div>
  )
}