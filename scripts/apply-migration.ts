#!/usr/bin/env bun
/**
 * Apply migration 008 to Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log('🚀 Applying Migration 008: Add Operational Columns\n');
  console.log(`🔗 Supabase: ${SUPABASE_URL}\n`);

  const migrationSQL = `
-- Add operational columns to interpreters table
ALTER TABLE interpreters
ADD COLUMN IF NOT EXISTS requires_reconfirmation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS operational_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS secondary_emails TEXT[];

-- Add comments for clarity
COMMENT ON COLUMN interpreters.requires_reconfirmation IS 'If true, add "PLEASE RECONFIRM" to email subject line (frequently queried)';
COMMENT ON COLUMN interpreters.operational_metadata IS 'JSONB store for less common operational flags: check_rate_with_court, no_booking_from_date, custom notes, etc.';
COMMENT ON COLUMN interpreters.secondary_emails IS 'Additional email addresses from Notion (Secondary Email, Third Email)';

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_interpreters_operational_metadata
ON interpreters USING gin (operational_metadata);
`;

  try {
    // Execute migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql function doesn't exist, try direct query
      console.log('⚠️  exec_sql function not available, trying direct execution...\n');

      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const stmt of statements) {
        if (!stmt) continue;

        console.log(`Executing: ${stmt.substring(0, 60)}...`);

        // Use the REST API to execute SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: stmt })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error: ${errorText}`);
          throw new Error(`Failed to execute statement: ${errorText}`);
        }
      }
    }

    console.log('\n✅ Migration 008 applied successfully!\n');
    console.log('Added columns:');
    console.log('  - requires_reconfirmation (BOOLEAN)');
    console.log('  - operational_metadata (JSONB)');
    console.log('  - secondary_emails (TEXT[])');
    console.log('  - idx_interpreters_operational_metadata (GIN index)');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nYou may need to apply this migration manually via Supabase dashboard:');
    console.error('1. Go to: https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd/editor');
    console.error('2. Open SQL Editor');
    console.error('3. Paste contents of web/supabase/migrations/008_add_operational_columns.sql');
    console.error('4. Run the query');
    process.exit(1);
  }
}

applyMigration();
