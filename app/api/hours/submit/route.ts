import { supabase } from "@/lib/supabase"; // Ensure supabase is initialized properly
import { NextResponse } from "next/server"; // Use NextResponse for Next.js API routes

export async function POST(req: Request) {
  try {
    // Parse the incoming request data
    const body = await req.json();
    const { employee_id, hours, minutes, work_date, submitted_by } = body;

    // Ensure necessary data is present
    if (!employee_id || hours === undefined || minutes === undefined || !work_date || !submitted_by) {
      return NextResponse.json(
        { error: "Missing employee id, hours, minutes, or other required data" },
        { status: 400 }
      );
    }

    // Convert hours and minutes to total minutes
    const addedMinutes = (Number(hours) * 60) + Number(minutes);

    // Step 2: Insert work hours data into the work_hours table
    const { error: insertError } = await supabase
      .from("work_hours")
      .insert([
        {
          employee_id,
          hours,
          minutes,
          work_date,
          submitted_by,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Work hours submitted successfully",
    });

  } catch (err) {
    console.error("Error submitting hours:", err);
    return NextResponse.json(
      { error: "Server error submitting hours" },
      { status: 500 }
    );
  }
}