import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📦 Applying migration 009: Add synced_at column...');
  
  const sql = readFileSync('../supabase/migrations/009_add_synced_at_column.sql', 'utf-8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  console.log('✅ Migration 009 applied successfully');
}

applyMigration();
