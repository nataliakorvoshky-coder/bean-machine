import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

  import cloudinary
  from "@/lib/cloudinary";

export async function POST(
  req: Request
) {

  try {

const formData =
  await req.formData();

const file =
  formData.get(
    "file"
  ) as File;

const complaintId =
  formData.get(
    "complaintId"
  ) as string;

const title =
  formData.get(
    "title"
  ) as string;

const description =
  formData.get(
    "description"
  ) as string;

const uploadedById =
  formData.get(
    "uploadedById"
  ) as string;

const uploadedByName =
  formData.get(
    "uploadedByName"
  ) as string;

    /*
      VALIDATION
    */

if (

  !complaintId ||

  !file

) {

      return NextResponse.json(

        {
          error:
            "Missing required fields",
        },

        {
          status: 400,
        }
      );
    }


    const bytes =
  await file.arrayBuffer();

const buffer =
  Buffer.from(bytes);

const base64 =
  `data:${file.type};base64,${buffer.toString("base64")}`;

const result =
  await cloudinary.uploader.upload(

    base64,

    {

      folder:
        "complaint-evidence",

      resource_type:
        "auto",
    }
  );

const fileUrl =
  result.secure_url;

const fileType =
  result.resource_type;

const storagePath =
  result.public_id;

    /*
      CREATE EVIDENCE
    */

    const {

      data,

      error,

    } = await supabase

      .from(
        "complaint_evidence"
      )

      .insert({

        complaint_id:
          complaintId,

        title:
          title || null,

        description:
          description || null,

        file_url:
          fileUrl,

        file_type:
          fileType || null,

        storage_path:
          storagePath || null,

        uploaded_by_id:
          uploadedById || null,

        uploaded_by_name:
          uploadedByName || null,

        created_at:
          new Date()
            .toISOString(),

      })

      .select()

      .single();

    if (error) {

      return NextResponse.json(

        {
          error:
            error.message,
        },

        {
          status: 500,
        }
      );
    }

    /*
      UPDATE COMPLAINT
    */

    await supabase

      .from(
        "complaint_requests"
      )

      .update({

        last_activity_at:
          new Date()
            .toISOString(),

      })

      .eq(
        "id",
        complaintId
      );

    return NextResponse.json({

      success: true,

      evidence:
        data,

    });

  } catch (err: any) {

    return NextResponse.json(

      {
        error:
          err.message,
      },

      {
        status: 500,
      }
    );
  }
}