// app/api/convert-external-to-stock/route.ts

import { supabase } from "@/lib/supabase"; // Assuming supabase client is already set up

// Handle POST request for converting external stock to stock items
export async function POST(req: Request) {
  const { externalStockId, stockItemId, quantity } = await req.json();

  if (!externalStockId || !stockItemId || quantity <= 0) {
    return new Response(
      JSON.stringify({ message: "Invalid data" }),
      { status: 400 }
    );
  }

  // Ensure external stock item exists
  const { data: externalStockData, error: externalStockError } = await supabase
    .from("external_stock")
    .select("id")
    .eq("id", externalStockId)
    .single();

  if (externalStockError || !externalStockData) {
    return new Response(
      JSON.stringify({ message: "External stock item not found" }),
      { status: 404 }
    );
  }

  // Ensure stock item exists
  const { data: stockItemData, error: stockItemError } = await supabase
    .from("stock_items")
    .select("id")
    .eq("id", stockItemId)
    .single();

  if (stockItemError || !stockItemData) {
    return new Response(
      JSON.stringify({ message: "Stock item not found" }),
      { status: 404 }
    );
  }

  // Create item conversion record
  const { data, error } = await supabase
    .from("item_conversion")
    .insert([{ external_stock_item_id: externalStockId, stock_item_id: stockItemId, quantity }]);

  if (error) {
    return new Response(
      JSON.stringify({ message: "Error creating conversion", error: error.message }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ message: "Conversion successful", data }),
    { status: 200 }
  );
}

// Handle GET request to fetch item conversions
export async function GET(req: Request) {
  const { data, error } = await supabase
    .from("item_conversion")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching conversions", error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data), { status: 200 });
}