// /app/api/stock-items/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase'; // Adjust based on your setup

// Handle GET request to fetch stock items
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*');

    if (error) {
      return res.status(500).json({ message: 'Error fetching stock items', error: error.message });
    }

    return res.status(200).json(data);
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}