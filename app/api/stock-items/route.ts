// /app/api/stock-items/route.ts

import { supabase } from "@/lib/supabase"; // Adjust based on your setup
import { NextResponse } from "next/server";

// Handle GET request to fetch stock items
export async function GET() {
  try {
    const { data, error } = await supabase.from('stock_items').select('*');

    if (error) {
      throw new Error(error.message); // Ensure the error is cast to Error type
    }

    return NextResponse.json(data); // Return the data in JSON format
  } catch (error: unknown) { // Ensure error is typed as 'unknown'
    // Typecast error as an instance of 'Error' to access 'message' safely
    if (error instanceof Error) {
      return NextResponse.json({ message: "Error fetching stock items", error: error.message }, { status: 500 });
    }

    // Fallback error handling if it's not an instance of Error
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}