#!/usr/bin/env bun
/**
 * Check jobs table contents
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkJobs() {
  console.log('Checking interpreting_jobs table...');
  const { data, error, count } = await supabase
    .from('interpreting_jobs')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total count: ${count}`);
  console.log(`Sample data:`, data);

  if (count && count > 0) {
    console.log(`\n⚠️  Found ${count} records in interpreting_jobs table`);
    console.log('Do you want to delete them? (This will require updating the delete script)');
  } else {
    console.log('\n✅ Table is empty - no cleanup needed');
  }
}

checkJobs();
