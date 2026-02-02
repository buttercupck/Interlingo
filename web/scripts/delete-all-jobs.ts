#!/usr/bin/env bun
/**
 * Delete all jobs from Supabase database
 * Use with caution - this will permanently delete all job records
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteAllJobs() {
  console.log('⚠️  WARNING: About to delete ALL commitment_blocks (jobs) from database');
  console.log('Counting commitment_blocks...');

  // Count commitment_blocks first
  const { count, error: countError } = await supabase
    .from('commitment_blocks')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting commitment_blocks:', countError);
    process.exit(1);
  }

  console.log(`Found ${count} commitment_blocks to delete`);

  if (count === 0) {
    console.log('No commitment_blocks to delete');
    process.exit(0);
  }

  // Delete all commitment_blocks
  console.log('Deleting all commitment_blocks...');
  const { error: deleteError, count: deletedCount } = await supabase
    .from('commitment_blocks')
    .delete({ count: 'exact' })
    .gte('created_at', '1970-01-01T00:00:00Z'); // Match all records

  if (deleteError) {
    console.error('Error deleting commitment_blocks:', deleteError);
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${deletedCount ?? count} commitment_blocks`);
}

deleteAllJobs();
