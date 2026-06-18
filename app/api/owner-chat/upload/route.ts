import { NextResponse }
  from "next/server";

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

    if (!file) {

      return NextResponse.json(

        {
          error:
            "No file uploaded",
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
            "owner-chat",

          resource_type:
            "auto",

        }
      );

    return NextResponse.json({

      url:

        result.resource_type ===
        "video"

          ? result.secure_url.replace(

              "/upload/",

              "/upload/f_auto,q_auto/"
            )

          : result.secure_url,

      path:
        result.public_id,

      type:
        result.resource_type,

      original_name:
        file.name,

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