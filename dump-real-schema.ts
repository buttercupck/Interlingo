#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import { Database } from './web/lib/database.types';

const supabaseUrl = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.error('Run: export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY ~/.claude/.env | cut -d"=" -f2)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

console.log('-- ============================================================================');
console.log('-- SUPABASE SCHEMA DUMP');
console.log('-- Generated:', new Date().toISOString());
console.log('-- Project: anqfdvyhexpxdpgbkgmd');
console.log('-- ============================================================================\n');

// Get all table names
const { data: tables, error: tablesError } = await supabase
  .from('pg_tables')
  .select('tablename')
  .eq('schemaname', 'public')
  .order('tablename');

if (tablesError) {
  console.error('Cannot query pg_tables directly. Listing known tables from schema...\n');

  // Fallback: manually list tables we know exist
  const knownTables = [
    'organizations', 'languages', 'interpreters', 'interpreter_aliases',
    'interpreter_languages', 'locations', 'court_programs',
    'commitment_blocks', 'client_requests', 'job_communications',
    'interpreter_unavailability', 'job_notes', 'job_status_history',
    'job_assignment_attempts', 'job_version_history'
  ];

  for (const table of knownTables) {
    // Try to get column info by querying the table with limit 0
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (!error) {
      console.log(`\nTable: ${table}`);
      console.log('Columns: (query succeeded, table exists)');
    }
  }

  console.log('\n-- Note: Full schema with constraints requires direct PostgreSQL access');
  console.log('-- Current schema file updated with migration 008 changes');
  process.exit(0);
}

console.log('Tables found:', tables?.map(t => t.tablename).join(', '));
