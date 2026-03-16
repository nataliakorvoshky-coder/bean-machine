import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    console.log("Received action:", action);
    console.log("Received body:", body);

    /* ================================= */
    /* Add STOCK ITEMS                   */
    /* ================================= */
    if (action === "addStockItem") {
      const { name, section, current_amount, goal_amount } = body

      // Ensure all required fields are present
      if (!name || !section || current_amount === undefined || goal_amount === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const { error } = await supabase
        .from("stock_items")
        .insert([{ name, section, current_amount, goal_amount }])

      if (error) {
        console.error("Error inserting stock item:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("Stock item added successfully");
      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* Delete Stock Items                */
    /* ================================= */
    if (action === 'deleteStockItem') {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: "Stock item ID is required" }, { status: 400 })
      }

      console.log("Deleting stock item with ID:", id);

      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id)  // Ensure the column name matches

      if (error) {
        console.error("Error deleting stock item:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("Stock item deleted successfully");
      return NextResponse.json({ success: true })
    }

    /* ================================= */
    /* GET STOCK ITEMS                   */
    /* ================================= */
if (action === "getStockItems") {
  try {
    // Fetch data from the stock_items table
    const { data, error } = await supabase
      .from("stock_items")
      .select("*") // Fetch all columns, or modify if you need specific ones
      .order("name"); // Ordering by name, you can change if necessary

    // Log the data fetched
    console.log("Fetched Data from Supabase:", data);

    // If there is an error fetching from Supabase
    if (error) {
      console.error("Error fetching stock items:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the fetched data, or an empty array if no data is found
    return NextResponse.json(data ?? []);

  } catch (err: unknown) {
    // Catch any unexpected errors
    if (err instanceof Error) {
      console.error("Unexpected error fetching stock items:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error("Unexpected error:", err);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
  }
}

    /* ================================= */
    /* Get External Stock                */
    /* ================================= */
if (action === "getExternalStock") {
  const { data, error } = await supabase
    .from("external_stock")  // Make sure the table name is correct
    .select("*")  // You can modify the columns if you need specific ones
    .order("name");  // Optional, order by name or another column

  if (error) {
    console.error("Error fetching external stock:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);  // Returns the data or an empty array
}

/* ================================= */
/* ADD EXTERNAL STOCK               */
/* ================================= */
if (action === "addExternalStock") {
  const { name, price } = body;

  // Ensure that required fields are provided
  if (!name || price === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Insert the new external stock into the database
  const { error } = await supabase
    .from("external_stock")
    .insert([{ name, price }]);

  if (error) {
    console.error("Error inserting external stock:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("External stock added successfully");
  return NextResponse.json({ success: true });
}

/* ================================= */
/* DELETE EXTERNAL STOCK             */
/* ================================= */
if (action === "deleteExternalStock") {
  const { id } = body;

  // Ensure that the stock item ID is provided
  if (!id) {
    return NextResponse.json({ error: "External stock ID is required" }, { status: 400 });
  }

  // Delete the external stock from the database
  const { error } = await supabase
    .from("external_stock")
    .delete()
    .eq("id", id);  // Ensure the column name matches

  if (error) {
    console.error("Error deleting external stock:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("External stock deleted successfully");
  return NextResponse.json({ success: true });
}

/* ================================= */
/* ADD CONVERSION                    */
/* ================================= */
if (action === "createConversion") {
  const { externalStockId, stockItemId, externalQuantity, stockQuantity } = body;

  // Ensure all required fields are present
  if (!externalStockId || !stockItemId || externalQuantity === undefined || stockQuantity === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Insert the conversion into the database
  const { error } = await supabase
    .from("item_conversion")
    .insert([{
      external_stock_item_id: externalStockId,
      stock_item_id: stockItemId,
      external_quantity: externalQuantity,
      stock_quantity: stockQuantity
    }]);

  if (error) {
    console.error("Error adding conversion:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("Conversion added successfully");
  return NextResponse.json({ success: true });
}

/* ================================= */
/* DELETE CONVERSION                 */
/* ================================= */
if (action === "deleteConversion") {
  const { id } = body;

  // Ensure the conversion ID is provided
  if (!id) {
    return NextResponse.json({ error: "Conversion ID is required" }, { status: 400 });
  }

  // Delete the conversion from the database
  const { error } = await supabase
    .from("item_conversion")
    .delete()
    .eq("id", id);  // Ensure the column name matches

  if (error) {
    console.error("Error deleting conversion:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("Conversion deleted successfully");
  return NextResponse.json({ success: true });
}

    /* ================================= */
    /* Get Conversion History         */
    /* ================================= */
// GET Conversions
if (action === "getConversions") {
  const { data, error } = await supabase
    .from("item_conversion")
    .select(`
      id,
      external_quantity,
      stock_quantity,
      external_stock:external_stock_item_id(name),
      stock_item:stock_item_id(name)
    `)

  if (error) throw error

  console.log("Fetched Conversions Data:", data); // Check data structure here
  return NextResponse.json(data ?? [])
}

    /* ================================= */
    /* Update Stock Current              */
    /* ================================= */
    if (action === "updateStockCurrent") {
      const { id, current_amount } = body

      if (!id || typeof current_amount !== "number") {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 })
      }

      console.log("Updating current stock for item with ID:", id);
      console.log("New current_amount:", current_amount);

      const { data, error } = await supabase
        .from("stock_items")
        .update({ current_amount })
        .eq("id", id)

      if (error) {
        console.error("Error updating stock item:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data ?? [])
    }

    /* ================================= */
    /* Update Stock Goal                 */
    /* ================================= */
    if (action === "updateStockGoal") {
      const { id, goal_amount } = body

      if (!id || typeof goal_amount !== "number") {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 })
      }

      console.log("Updating stock goal for item with ID:", id)
      console.log("New goal_amount:", goal_amount)

      const { data, error } = await supabase
        .from("stock_items")
        .update({ goal_amount })
        .eq("id", id)
        .select() // Use select() to return the updated data after the update

      if (error) {
        console.error("Error updating stock goal:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data ?? [])
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Inventory API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


