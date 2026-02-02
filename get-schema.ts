#!/usr/bin/env bun

// Get full PostgreSQL schema from Supabase
const supabaseUrl = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const serviceKey = Bun.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

// Use PostgREST to query information_schema
async function getSchema() {
  // Get tables
  const tablesRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_schema_tables`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!tablesRes.ok) {
    // Fallback: query pg_catalog directly via REST API won't work
    // Let's try using pg_dump via connection pooler
    console.log('-- Schema dump via pg_dump required');
    console.log('-- Connection string:');
    console.log(`postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`);
    process.exit(1);
  }
}

// Alternative: use SQL query via supabase-js client
import { createClient } from '@supabase/supabase-js';

const client = createClient(supabaseUrl, serviceKey, {
  db: {
    schema: 'public',
  },
});

// Query all tables and columns
const { data: tables, error } = await client
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .eq('table_type', 'BASE TABLE');

if (error) {
  console.error('Error querying tables:', error);

  // Try using raw SQL through a custom function
  console.log('Attempting to use pg_dump...');

  // Since we can't easily query information_schema, let's read the migration files
  console.log('\n-- Reading from migration files instead...\n');

  process.exit(1);
}

console.log('Tables found:', tables);

getSchema();
