import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { entities } = req.body;

    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid entities array. Provide an array of entity names to create.',
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

    // Define table schemas
    const tableSchemas = {
      organizations: `
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      members: `
        CREATE TABLE IF NOT EXISTS members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      bots: `
        CREATE TABLE IF NOT EXISTS bots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          model_choice TEXT,
          settings JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      channels: `
        CREATE TABLE IF NOT EXISTS channels (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          external_id TEXT,
          status TEXT
        );
      `,
      leads: `
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
          name TEXT,
          phone TEXT,
          email TEXT,
          zip TEXT,
          intent TEXT,
          confidence NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    };

    // Validate requested entities
    const validEntities = Object.keys(tableSchemas);
    const invalidEntities = entities.filter((e) => !validEntities.includes(e));

    if (invalidEntities.length > 0) {
      return res.status(400).json({
        error: `Invalid entities: ${invalidEntities.join(', ')}`,
        validEntities,
      });
    }

    // Generate SQL statements for requested entities
    const sqlStatements = entities.map((entity) => ({
      entity,
      sql: tableSchemas[entity].trim(),
    }));

    // Combine all SQL statements
    const combinedSql = sqlStatements
      .map((stmt) => `-- ${stmt.entity}\n${stmt.sql}`)
      .join('\n\n');

    // Attempt to execute SQL via Supabase Management API or RPC
    // Note: Direct SQL execution requires a custom RPC function in Supabase
    // For now, we'll return the SQL statements for manual execution
    // Users can execute these in Supabase SQL Editor or set up an exec_sql RPC function

    // Try to execute via RPC if available (optional - will fail gracefully)
    const executionResults = [];
    for (const stmt of sqlStatements) {
      try {
        // Attempt RPC execution (requires exec_sql function in Supabase)
        const { error } = await supabase.rpc('exec_sql', { sql_query: stmt.sql });
        
        if (error) {
          // RPC not available - this is expected for most setups
          executionResults.push({
            entity: stmt.entity,
            status: 'sql_provided',
            note: 'Execute SQL manually in Supabase SQL Editor',
          });
        } else {
          executionResults.push({
            entity: stmt.entity,
            status: 'created',
          });
        }
      } catch (error) {
        // RPC function doesn't exist - provide SQL for manual execution
        executionResults.push({
          entity: stmt.entity,
          status: 'sql_provided',
          note: 'Execute SQL manually in Supabase SQL Editor',
        });
      }
    }

    const createdCount = executionResults.filter((r) => r.status === 'created').length;
    const needsManualExecution = createdCount === 0;

    return res.status(200).json({
      success: !needsManualExecution,
      message: needsManualExecution
        ? `SQL statements generated. Execute them in Supabase SQL Editor (Dashboard → SQL Editor).`
        : `Successfully created ${createdCount} table(s)`,
      requested: entities,
      sql: combinedSql,
      results: executionResults,
      instructions: needsManualExecution
        ? 'Copy the SQL from the "sql" field and execute it in Supabase Dashboard → SQL Editor'
        : undefined,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

