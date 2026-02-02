#!/usr/bin/env bun

/**
 * Migration Runner
 *
 * Runs SQL migrations against the Supabase database.
 * Usage: bun run run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runMigration(migrationFile: string) {
  console.log(`\n🔄 Running migration: ${migrationFile}`);

  // Create Supabase client with service role
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read migration SQL file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFile);
    const sql = await readFile(migrationPath, 'utf-8');

    // Execute the SQL
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We need to use the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // If exec_sql doesn't exist, we need to run this manually via Supabase Dashboard
      console.log('\n⚠️  Cannot execute SQL automatically via API.');
      console.log('📋 Please run this migration manually in your Supabase SQL Editor:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd/sql');
      console.log('   2. Paste the SQL from: supabase/migrations/001_add_org_config.sql');
      console.log('   3. Click "Run"');
      console.log('\n📄 Migration SQL:\n');
      console.log('─'.repeat(80));
      console.log(sql);
      console.log('─'.repeat(80));
      return;
    }

    console.log('✅ Migration completed successfully');

    // Verify the change
    const { data, error } = await supabase
      .from('organizations')
      .select('name, config')
      .eq('name', 'Kent Municipal Court')
      .single();

    if (error) {
      console.log('⚠️  Could not verify migration:', error.message);
    } else if (data) {
      console.log('\n✓ Verified: Kent Municipal Court config is set');
      console.log('Config:', JSON.stringify(data.config, null, 2));
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration('001_add_org_config.sql');
