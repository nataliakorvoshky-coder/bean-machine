"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useRouter
} from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/logActivity";
import StyledDropdown from "@/components/StyledDropdown";
import StyledDatePicker from "@/components/StyledDatePicker";

const exceptionTypes = [


  {
    id: "Hours Correction",
    name: "Hours Correction",
  },

  {
    id: "Schedule Adjustment",
    name: "Schedule Adjustment",
  },

  {
    id: "Attendance Issue",
    name: "Attendance Issue",
  },

  {
    id: "Other",
    name: "Other",
  },
];

export default function HoursExceptionPage() {

  const router =
  useRouter();

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [form, setForm] = useState({

    exception_type: "",

    requested_hours: "",

    current_hours: 0,

    required_hours: 0,

    week_of: "",

    subject: "",

    description: "",

    photo: null as File | null,

    video: null as File | null,
  });

  useEffect(() => {

    loadEmployeeHours();

  }, []);

  async function loadEmployeeHours() {

    try {

      const {
        data: auth,
      } = await supabase
        .auth
        .getUser();

      const user =
        auth?.user;

      if (!user)
        return;

      const {
        data: profile,
      } = await supabase

        .from("profiles")

        .select(`
          employees (
            id,
            name,
            rank_id
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

      if (!employeeData)
        return;

      const {
        data: hoursData
      } = await supabase

        .from("employee_hours")

        .select(`
          current_hours
        `)

        .eq(
          "employee_id",
          employeeData.id
        )

        .single();

      const {
        data: rankData
      } = await supabase

        .from("ranks")

        .select(`
          hours_required
        `)

        .eq(
          "id",
          employeeData.rank_id
        )

        .single();

      setForm((prev) => ({

        ...prev,

        current_hours:
          hoursData?.current_hours || 0,

        required_hours:
          rankData?.hours_required || 0,
      }));

    } catch (err) {

      console.error(err);
    }
  }

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
      let videoUrl = null;

      /* PHOTO */

      if (form.photo) {

        const photoPath =

          `hours-photos/${
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

      /* VIDEO */

      if (form.video) {

        const videoPath =

          `hours-videos/${
            Date.now()
          }-${form.video.name}`;

        const {
          error: videoError
        } = await supabase.storage

          .from("incident-media")

          .upload(
            videoPath,
            form.video
          );

        if (!videoError) {

          const {
            data
          } = supabase.storage

            .from("incident-media")

            .getPublicUrl(
              videoPath
            );

          videoUrl =
            data.publicUrl;
        }
      }

      const { error } =
        await supabase

          .from(
            "hours_exception_requests"
          )

          .insert({

            employee_id:
              employeeData?.id,

            employee_name:
              employeeData?.name,

            exception_type:
              form.exception_type,

            requested_hours:
              Number(
                form.requested_hours
              ),

            current_hours:
              form.current_hours,

            required_hours:
              form.required_hours,

            week_of:
              form.week_of,

            subject:
              form.subject,

            reason:
              form.description,

            photo_url:
              photoUrl,

            video_url:
              videoUrl,

            status:
              "Pending",
          });

      if (error) {

        console.error(error);

        alert(error.message);

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
      `Submitted hours exception: ${form.subject}`,

    type:
      "hours_exception",

    userId:
      user.id,

    username:
      profile?.username,

    employeeName:
      employeeData?.name,

    details: [

      {
        name:
          "Exception Type",

        amount:
          form.exception_type,
      },

      {
        name:
          "Requested Hours",

        amount:
          form.requested_hours,
      },

      {
        name:
          "Current Hours",

        amount:
          form.current_hours,
      },

      {
        name:
          "Required Hours",

        amount:
          form.required_hours,
      },

      {
        name:
          "Week Of",

        amount:
          form.week_of,
      },
    ],
  }),
});

router.push(
  "/employee/requests"
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
          Hours Exception Request
        </h1>

        <p
          className="
            text-emerald-600
            text-sm
          "
        >
          Submit missed punches,
          overtime approvals,
          or hours corrections.
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
          Request submitted
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

        {/* TOP GRID */}

        <div
          className="
            grid
            md:grid-cols-3
            gap-5
          "
        >

          {/* TYPE */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Exception Type
            </div>

            <StyledDropdown

              placeholder="
                Select exception
              "

              options={
                exceptionTypes
              }

              value={
                form.exception_type
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  exception_type:
                    value,
                })
              }

              width="100%"
            />

          </div>

          {/* HOURS */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Requested Hours
            </div>

            <input

              type="number"

              value={
                form.requested_hours
              }

              onChange={(e)=>

                setForm({

                  ...form,

                  requested_hours:
                    e.target.value,
                })
              }

              placeholder="
                Example: 4
              "

className="
  w-full
  h-[38px]

  rounded-xl
  border
  border-emerald-200

  bg-white

  px-3

  text-emerald-700

  outline-none

  focus:border-emerald-500
  focus:ring-2
  focus:ring-emerald-200
"
            />

          </div>

          {/* WEEK */}

          <div>

            <div
              className="
                text-sm
                font-semibold
                text-emerald-700
                mb-2
              "
            >
              Week Of
            </div>

            <StyledDatePicker

              value={
                form.week_of
              }

              onChange={(value)=>

                setForm({

                  ...form,

                  week_of:
                    value,
                })
              }
            />

          </div>

        </div>

        {/* HOURS PANEL */}

        <div
          className="
            bg-emerald-50
            border
            border-emerald-200
            rounded-2xl
            p-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
            "
          >

            <div>

              <div
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-emerald-600
                  font-semibold
                "
              >
                Current Weekly Hours
              </div>

              <div
                className="
                  text-2xl
                  font-bold
                  text-emerald-700
                "
              >

                {form.current_hours}

                <span
                  className="
                    text-base
                    text-emerald-500
                    ml-1
                  "
                >

                  / {

                    form.required_hours > 0

                      ? form.required_hours

                      : "--"
                  }

                </span>

              </div>

            </div>

            <div
              className="
                text-right
              "
            >

              <div
                className="
                  text-sm
                  font-semibold
                  text-emerald-700
                "
              >

                {form.required_hours > 0

                  ? Math.min(

                      Math.round(

                        (
                          (
                            form.current_hours
                          )
                          /
                          form.required_hours
                        ) * 100
                      ),

                      100
                    )

                  : 0}%

              </div>

              <div
                className="
                  text-xs
                  text-emerald-500
                "
              >
                Weekly Goal
              </div>

            </div>

          </div>

          {/* BAR */}

          <div
            className="
              w-full
              h-3
              bg-emerald-100
              rounded-full
              overflow-hidden
            "
          >

            <div

              className={`
                h-full
                rounded-full
                transition-all
                duration-500

                ${
                  form.required_hours <= 0

                    ? "bg-gray-300"

                    : form.current_hours
                      >= form.required_hours

                    ? "bg-emerald-500"

                    : form.current_hours
                      >= form.required_hours * 0.7

                    ? "bg-yellow-400"

                    : "bg-red-400"
                }
              `}

              style={{

                width: `${
                  form.required_hours > 0

                    ? Math.min(

                        (
                          (
                            form.current_hours
                          )
                          /
                          form.required_hours
                        ) * 100,

                        100
                      )

                    : 0
                }%`
              }}
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
            Reason
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
              Explain the hours
              exception in detail
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

        {/* UPLOADS */}

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