#!/usr/bin/env bun
/**
 * Count jobs in Supabase database to verify deletion
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countJobs() {
  console.log('Checking commitment_blocks table...');

  // Count total records
  const { count, error: countError } = await supabase
    .from('commitment_blocks')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting commitment_blocks:', countError);
    process.exit(1);
  }

  console.log(`\nTotal commitment_blocks in database: ${count}`);

  if (count && count > 0) {
    // Get a sample of the records to see what's there
    const { data, error: selectError } = await supabase
      .from('commitment_blocks')
      .select('id, created_at, status, modality')
      .limit(5);

    if (selectError) {
      console.error('Error fetching sample records:', selectError);
    } else {
      console.log('\nSample records:');
      data?.forEach((record, idx) => {
        console.log(`  ${idx + 1}. ID: ${record.id.substring(0, 8)}... Status: ${record.status} Modality: ${record.modality}`);
      });
    }
  }
}

countJobs();
