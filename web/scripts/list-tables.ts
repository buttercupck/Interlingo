#!/usr/bin/env bun
/**
 * List all tables in Supabase database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  // Try to query some common table names
  const tablesToCheck = ['jobs', 'interpreting_jobs', 'assignments', 'organizations', 'interpreters'];

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ Table "${table}" exists with ${count} records`);
    } else {
      console.log(`❌ Table "${table}" does not exist or is not accessible`);
    }
  }
}

listTables();
