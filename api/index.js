import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET request - health check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Supabase MCP Bridge Active ✅' });
  }

  // POST request - CRUD operations
  if (req.method === 'POST') {
    try {
      const { action, table, data, query = '*' } = req.body;

      // Validate required fields
      if (!action || !table) {
        return res.status(400).json({
          error: 'Missing required fields: action and table are required',
        });
      }

      // Validate action type
      if (!['select', 'insert', 'update'].includes(action)) {
        return res.status(400).json({
          error: 'Invalid action. Must be one of: select, insert, update',
        });
      }

      // Initialize Supabase client
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
          error: 'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Perform the requested action
      let result;

      switch (action) {
        case 'select':
          result = await supabase.from(table).select(query);
          break;

        case 'insert':
          if (!data) {
            return res.status(400).json({
              error: 'Missing required field: data is required for insert operations',
            });
          }
          // Support both single object and array of objects
          const insertData = Array.isArray(data) ? data : [data];
          result = await supabase.from(table).insert(insertData);
          break;

        case 'update':
          if (!data) {
            return res.status(400).json({
              error: 'Missing required field: data is required for update operations',
            });
          }
          // Extract filter conditions from data if provided
          const { id, ...updateData } = data;
          let updateQuery = supabase.from(table).update(updateData);
          
          // If id is provided, use it as a filter
          if (id) {
            updateQuery = updateQuery.eq('id', id);
          }
          
          result = await updateQuery;
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      // Check for errors
      if (result.error) {
        return res.status(400).json({
          error: result.error.message,
          details: result.error,
        });
      }

      // Return success response
      return res.status(200).json({
        success: true,
        action,
        table,
        data: result.data,
        count: result.data?.length || (result.data ? 1 : 0),
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

