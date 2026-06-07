"use client";

import {
  useState
} from "react";

import {
  useRouter
} from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/logActivity";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker";

const requestTypes = [

  {
    id: "LOA",
    name: "Leave Of Absence",
  },

  {
    id: "ROA",
    name: "Reduction of Activity",
  },
];

const leaveReasons = [


  {
    id: "Personal",
    name: "Personal",
  },

  {
    id: "Vacation",
    name: "Vacation",
  },


  {
    id: "Other",
    name: "Other",
  },
];

export default function LoaRequestPage() {

  const router =
  useRouter();

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [form, setForm] = useState({

    request_type: "",

    leave_reason: "",

    start_date: "",

    end_date: "",

    subject: "",

    description: "",

    photo: null as File | null,

    document: null as File | null,
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
        );

        return;
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

        .single();

      const employeeData =
        Array.isArray(
          profile?.employees
        )
          ? profile.employees[0]
          : profile?.employees;

      let photoUrl = null;
      let documentUrl = null;

      /* PHOTO */

      if (form.photo) {

        const photoPath =

          `loa-photos/${
            Date.now()
          }-${form.photo.name}`;

        const {
          error: photoError
        } = await supabase.storage

          .from("incident-media")

          .upload(
            photoPath,
            form.photo
          );

        if (!photoError) {

          const {
            data
          } = supabase.storage

            .from("incident-media")

            .getPublicUrl(
              photoPath
            );

          photoUrl =
            data.publicUrl;
        }
      }

      /* DOCUMENT */

      if (form.document) {

        const documentPath =

          `loa-documents/${
            Date.now()
          }-${form.document.name}`;

        const {
          error: documentError
        } = await supabase.storage

          .from("incident-media")

          .upload(
            documentPath,
            form.document
          );

        if (!documentError) {

          const {
            data
          } = supabase.storage

            .from("incident-media")

            .getPublicUrl(
              documentPath
            );

          documentUrl =
            data.publicUrl;
        }
      }

  const res = await fetch(

  "/api/employee/loa/submit",

  {

    method: "POST",

    headers: {

      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({

      employee_id:
        employeeData?.id,

      employee_name:
        employeeData?.name,

      request_type:
        form.request_type,

      leave_reason:
        form.leave_reason,

      start_date:
        form.start_date,

      end_date:
        form.end_date,

      subject:
        form.subject,

      description:
        form.description,

      photo_url:
        photoUrl,

      document_url:
        documentUrl,
    }),
  }
);

const result =
  await res.json();

if (!res.ok) {

  alert(
    result.error
  );

  return;
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
      `Submitted ${form.request_type} request: ${form.subject}`,

    type:
      "loa_request",

    userId:
      user.id,

    username:
      profile?.username,

    employeeName:
      employeeData?.name,

    details: [

      {
        name:
          "Request Type",

        amount:
          form.request_type,
      },

      {
        name:
          "Leave Reason",

        amount:
          form.leave_reason,
      },

      {
        name:
          "Start Date",

        amount:
          form.start_date,
      },

      {
        name:
          "End Date",

        amount:
          form.end_date,
      },

      {
        name:
          "Subject",

        amount:
          form.subject,
      },
    ],
  }),
});

router.push(
  `/employee/requests/loa-roa/${result.request.id}`
);

    } catch (err) {

      console.error(err);

      alert(
        "Failed to submit request"
      );

    } finally {

      setLoading(false);
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
          LOA / ROA Request
        </h1>

        <p
          className="
            text-emerald-600
            text-sm
          "
        >
          Submit leave of absence, temporary leave or return to work requests.
        </p>

      </div>


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

        {/* TOP GRID */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-5
          "
        >

          {/* REQUEST TYPE */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Request Type
            </div>

            <StyledDropdown

              placeholder="
                Select request
              "

              options={
                requestTypes
              }

              value={
                form.request_type
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  request_type:
                    value,
                })
              }

              width="100%"
            />

          </div>

          {/* REASON */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Leave Reason
            </div>

            <StyledDropdown

              placeholder="
                Select reason
              "

              options={
                leaveReasons
              }

              value={
                form.leave_reason
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  leave_reason:
                    value,
                })
              }

              width="100%"
            />

          </div>

        </div>

        {/* DATES */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-5
          "
        >

          {/* START */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Start Date
            </div>

            <StyledDatePicker

              value={
                form.start_date
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  start_date:
                    value,
                })
              }
            />

          </div>

          {/* END */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              End Date
            </div>

            <StyledDatePicker

              value={
                form.end_date
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  end_date:
                    value,
                })
              }
            />

          </div>

</div>

        {/* SUBJECT */}

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

            onChange={(e)=>

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

        {/* DESCRIPTION */}

        <div>

          <div
            className="
              text-sm
              font-semibold
              text-emerald-700
              mb-2
            "
          >
            Description
          </div>

          <textarea

            rows={4}

            value={
              form.description
            }

            onChange={(e)=>

              setForm({

                ...form,

                description:
                  e.target.value,
              })
            }

            placeholder="
              Explain your request
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


        {/* FILES */}

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

          {/* DOCUMENT */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Upload Document
            </div>

            <input

              type="file"

              accept=".pdf,.doc,.docx,image/*"

              onChange={(e)=>

                setForm({

                  ...form,

                  document:
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

        {/* BUTTON */}

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
              : "Submit Request"}

          </button>

        </div>

      </form>

    </div>
  );
}