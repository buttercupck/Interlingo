#!/usr/bin/env bun
/**
 * Import interpreter batch to Supabase
 *
 * Prerequisites:
 * 1. Migration 008 must be applied first
 * 2. Requires SUPABASE_SERVICE_ROLE_KEY in environment
 *
 * Usage: bun import-batch.ts batch-A-C.csv
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.error('');
  console.error('To run this script, you need the service role key from Supabase dashboard:');
  console.error('1. Go to https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd/settings/api');
  console.error('2. Copy the "service_role" secret key (NOT the publishable key)');
  console.error('3. Run: SUPABASE_SERVICE_ROLE_KEY=your-key bun import-batch.ts batch-A-C.csv');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface CSVRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  timezone: string;
  license_number: string;
  languages_json: string;
  internal_notes: string;
  requires_reconfirmation: string;
  operational_metadata_json: string;
  secondary_emails_json: string;
}

interface LanguageData {
  name: string;
  certification: string;
}

async function ensureLanguageExists(languageName: string): Promise<string> {
  // Check if language exists
  const { data: existing, error: lookupError } = await supabase
    .from('languages')
    .select('id')
    .eq('name', languageName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create language if it doesn't exist
  const { data: newLang, error: createError } = await supabase
    .from('languages')
    .insert({ name: languageName })
    .select('id')
    .single();

  if (createError) {
    console.error(`❌ Error creating language "${languageName}":`, createError.message);
    throw createError;
  }

  console.log(`   ✅ Created new language: ${languageName}`);
  return newLang.id;
}

async function importInterpreter(row: CSVRow, index: number): Promise<void> {
  console.log(`\n${index + 1}. Importing ${row.first_name} ${row.last_name}...`);

  // Parse JSON fields
  const languages: LanguageData[] = JSON.parse(row.languages_json);
  const operationalMetadata = JSON.parse(row.operational_metadata_json);
  const secondaryEmails: string[] = JSON.parse(row.secondary_emails_json);

  // Insert interpreter
  const { data: interpreter, error: interpreterError } = await supabase
    .from('interpreters')
    .insert({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email || null,
      phone: row.phone || null,
      city: row.city || null,
      state: row.state || null,
      timezone: row.timezone || null,
      license_number: row.license_number || null,
      internal_notes: row.internal_notes || null,
      requires_reconfirmation: row.requires_reconfirmation === 'true',
      operational_metadata: operationalMetadata,
      secondary_emails: secondaryEmails.length > 0 ? secondaryEmails : null
    })
    .select('id')
    .single();

  if (interpreterError) {
    console.error(`   ❌ Error: ${interpreterError.message}`);
    throw interpreterError;
  }

  console.log(`   ✅ Interpreter created (ID: ${interpreter.id.substring(0, 8)}...)`);

  // Insert languages
  for (const lang of languages) {
    if (!lang.name) continue;

    const languageId = await ensureLanguageExists(lang.name);

    const { error: langError } = await supabase
      .from('interpreter_languages')
      .insert({
        interpreter_id: interpreter.id,
        language_id: languageId,
        certification: lang.certification,
        preference_rank: null // User said don't use preferred rankings
      });

    if (langError) {
      console.error(`   ❌ Error linking language "${lang.name}": ${langError.message}`);
      throw langError;
    }

    console.log(`   ✅ Linked language: ${lang.name} (${lang.certification})`);
  }
}

async function main() {
  const batchFile = process.argv[2];

  if (!batchFile) {
    console.error('Usage: bun import-batch.ts <batch-file.csv>');
    console.error('Example: bun import-batch.ts batch-A-C.csv');
    process.exit(1);
  }

  console.log('🚀 Interpreter Batch Import Script\n');
  console.log(`📁 File: ${batchFile}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}\n`);

  // Load CSV with relaxed parsing to handle embedded newlines
  const csvContent = await Bun.file(batchFile).text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    relax_column_count_more: true,
    escape: '"',
    quote: '"'
  }) as CSVRow[];

  console.log(`📊 Loaded ${records.length} records\n`);
  console.log('─'.repeat(80));

  // Import each record
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i++) {
    try {
      await importInterpreter(records[i], i);
      successCount++;
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Failed to import record ${i + 1}`);
      console.error(`   Error details: ${error.message || error}`);
      console.error(`   Record data:`, records[i]);

      // Stop on first error for debugging
      console.error('\n⚠️  Stopping import due to error. Fix the issue and resume.');
      process.exit(1);
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\n✅ Import complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${records.length}`);
}

main();
