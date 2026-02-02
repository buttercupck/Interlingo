#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Query information_schema to get table definitions
const query = `
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
`;

const { data, error } = await supabase.rpc('exec_sql', { query });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
