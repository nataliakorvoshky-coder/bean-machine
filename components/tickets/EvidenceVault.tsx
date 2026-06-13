"use client";

import {
  useEffect,
  useState,
} from "react";

type Props = {

  complaintId: string;

  uploadedByName: string;

};

export default function
EvidenceVault({

  complaintId,

  uploadedByName,

}: Props) {

  const [

    evidence,

    setEvidence

  ] = useState<any[]>([]);

  const [
  file,
  setFile
] = useState<File | null>(
  null
);

const [

  selectedEvidence,

  setSelectedEvidence

] = useState<any>(
  null
);

const [
  title,
  setTitle
] = useState("");

const [
  description,
  setDescription
] = useState("");

  const [

    loading,

    setLoading

  ] = useState(true);

  useEffect(() => {

    loadEvidence();

  }, [complaintId]);

  async function loadEvidence() {

    try {

      const res =
        await fetch(

          "/api/complaints/evidence/list",

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                complaintId,

              }),
          }
        );

      const data =
        await res.json();

      setEvidence(
        data.evidence || []
      );

      console.log(
  "Evidence:",
  evidence
);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  async function saveEvidence() {

  try {

    if (!file) {

      return;
    }

    /*
      UPLOAD TO CLOUDINARY
    */

const formData =
  new FormData();

formData.append(
  "file",
  file
);

formData.append(
  "complaintId",
  complaintId
);

formData.append(
  "title",
  title
);

formData.append(
  "description",
  description
);

console.log(
  "UPLOADED BY:",
  uploadedByName
);

formData.append(
  "uploadedByName",
  uploadedByName
);

const res =
  await fetch(

    "/api/complaints/evidence/upload",

    {

      method: "POST",

      body:
        formData,
    }
  );

const data =
  await res.json();

    if (!res.ok) {

      console.error(
        data
      );

      return;
    }

    /*
      RESET
    */

    setFile(null);

    setTitle("");

    setDescription("");

    /*
      RELOAD VAULT
    */

    loadEvidence();

  } catch (err) {

    console.error(err);
  }
}

const pandaPosition = Math.min(
  90,
  10 + evidence.length * 18
);

return (

<div
  className="
    relative

    bg-white
    border
    border-emerald-100
    rounded-2xl
    p-6

    pr-44
  "
>

<div
  className="
    flex
    items-center
    justify-between

    mb-6
  "
>

  <div
    className="
      text-xl
      font-bold

      text-emerald-700
    "
  >
    Evidence Vault
  </div>

<button

  onClick={()=>

    document
      .getElementById(
        "evidence-upload"
      )
      ?.click()

  }

  className="
    px-4
    py-2

    rounded-xl

    bg-emerald-600
    hover:bg-emerald-700

    text-white
    text-sm
    font-semibold
  "
>

  Upload Evidence

</button>

  <input

  id="evidence-upload"

  type="file"

  className="hidden"

  onChange={(e)=>

    setFile(
      e.target.files?.[0] || null
    )

  }
/>

</div>

{file && (

  <div
    className="
      mb-4

      border
      border-emerald-100

      bg-emerald-50

      rounded-2xl

      p-4
    "
  >

    <div
      className="
        text-sm
        font-semibold

        text-emerald-700

        mb-3
      "
    >
      Upload Evidence
    </div>

    <div
      className="
        text-xs
        text-gray-500

        mb-3
      "
    >
      Selected:
      {" "}
      {file.name}
    </div>

    <input

      value={title}

      onChange={(e)=>
        setTitle(
          e.target.value
        )
      }

      placeholder="
        Evidence Title
      "

      className="
        w-full

        border

        rounded-xl

        p-3

        mb-3
      "
    />

    <textarea

      value={description}

      onChange={(e)=>
        setDescription(
          e.target.value
        )
      }

      placeholder="
        Evidence Description
      "

      className="
        w-full

        border

        rounded-xl

        p-3

        h-24

        mb-3
      "
    />

<button

  onClick={
    saveEvidence
  }

  className="
    px-4
    py-2

    rounded-xl

    bg-emerald-600

    text-white
  "
>

  Save Evidence

</button>

  </div>

)}

{/* SHERLOCK PANDA RAIL */}

<div
  className="
    absolute
    top-0
    right-0

    h-full
    w-[180px]

    pointer-events-none
  "
>

  {/* EVIDENCE LIFT */}

  <div
    className="
      absolute
      top-4
      right-[40px]

      bg-amber-100
      border
      border-amber-300

      rounded-xl

      px-3
      py-2

      shadow-md

      text-xs
      font-bold

      text-amber-800
    "
  >
    📁 Evidence Lift
  </div>

  {/* PANDA */}

<div
  style={{
    top: `${pandaPosition}%`
  }}
  className="
    absolute

    right-[0px]

    -translate-y-1/2

    transition-all
    duration-700
  "
>

  {/* FULL LENGTH ROPE */}

  <div
    className="
      absolute

      left-[56px]

      -top-[500px]
      -bottom-[500px]

      w-[4px]

      bg-amber-700

      rounded-full

      -z-10
    "
  />

  <img
    src="/mascots/sherlock-panda.png"
    alt="Sherlock Panda"
    className="w-[170px]"
  />

</div>

</div>

    {loading && (

      <div>

        Loading...

      </div>

    )}

    {!

  loading &&

  evidence.length === 0 && (

    <div
      className="
        text-sm
        text-gray-500
      "
    >

      No evidence uploaded.

    </div>

)}

{evidence.map(

  item => (

<button

  key={item.id}

  onClick={()=>
    setSelectedEvidence(
      item
    )
  }

  className="
    w-full

    text-left

    border
    border-gray-200

    rounded-xl

    p-4

    mb-3

    hover:border-emerald-300

    hover:bg-emerald-50

    transition
  "
>

  <div
  className="
    text-2xl
    mb-2
  "
>

  {item.file_type ===
    "video"

      ? "🎥"

      : item.file_type ===
        "image"

        ? "📷"

        : "📄"}

</div>

      <div
        className="
          font-semibold
          text-emerald-700
        "
      >

        {item.title ||

          "Untitled Evidence"}

      </div>

      <div
        className="
          text-sm
          text-gray-500

          mt-1
        "
      >

        {item.description}

      </div>

      <div
        className="
          text-xs
          text-gray-400

          mt-2
        "
      >

        Uploaded By:

        {" "}

        {item.uploaded_by_name}

      </div>

      <div
        className="
          text-xs
          text-gray-400
        "
      >

        {new Date(

          item.created_at

        ).toLocaleString()}

      </div>

    </button>

  )

)}

{selectedEvidence && (

<div
  className="
    fixed
    inset-0

    bg-black/60

    z-50

    flex
    items-center
    justify-center

    p-6
  "

  onClick={()=>
    setSelectedEvidence(
      null
    )
  }
>

    <div
      className="
        bg-white

        rounded-2xl

        w-full
        max-w-6xl

        max-h-[90vh]

        overflow-auto

        p-6
      "
      onClick={(e)=>
  e.stopPropagation()
}
    >

      {/* HEADER */}

      <div
        className="
          flex
          justify-between

          mb-6
        "
      >

        <div>

          <div
            className="
              text-2xl
              font-bold

              text-emerald-700
            "
          >
            {selectedEvidence.title}
          </div>

          <div
            className="
              text-sm
              text-gray-500
            "
          >
<div
  className="
    text-sm
    text-gray-500
  "
>

  Uploaded By{" "}

  {selectedEvidence.uploaded_by_name}

</div>

<div
  className="
    text-xs
    text-gray-400
  "
>

  {new Date(

    selectedEvidence.created_at

  ).toLocaleString()}

</div>
          </div>

        </div>

        <button

          onClick={()=>
            setSelectedEvidence(
              null
            )
          }

          className="
            text-2xl
            font-bold
          "
        >
          ✕
        </button>

      </div>

      {/* PREVIEW */}

      {selectedEvidence.file_type ===
        "image" && (

        <img

          src={
            selectedEvidence.file_url
          }

          alt={
            selectedEvidence.title
          }

          className="
            w-full

            rounded-xl
          "
        />

      )}

      {selectedEvidence.file_type ===
        "video" && (

        <video

          src={
            selectedEvidence.file_url
          }

          controls

className="
  w-full

  rounded-xl

  max-h-[75vh]
"
        />

      )}

      {selectedEvidence.file_type ===
        "raw" && (

        <iframe

          src={
            selectedEvidence.file_url
          }

          className="
            w-full

            h-[800px]

            rounded-xl
          "
        />

      )}

      {/* DESCRIPTION */}

      <div
        className="
          mt-6

          text-sm
          text-gray-600
        "
      >
        {
          selectedEvidence.description
        }
      </div>

      {/* ACTIONS */}

      <div
        className="
          flex
          gap-2

          mt-6
        "
      >

        <a

          href={
            selectedEvidence.file_url
          }

          download

          target="_blank"

          rel="noreferrer"

          className="
            px-4
            py-2

            rounded-xl

            bg-emerald-100

            text-emerald-700
          "
        >
          Download
        </a>

        <button

          className="
            px-4
            py-2

            rounded-xl

            bg-amber-100

            text-amber-700
          "
        >
          Rename
        </button>

        <button

          className="
            px-4
            py-2

            rounded-xl

            bg-red-100

            text-red-700
          "
        >
          Delete
        </button>

      </div>

    </div>

  </div>

)}

  </div>  

);

}