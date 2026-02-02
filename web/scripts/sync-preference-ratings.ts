import { createClient } from '../lib/supabase/client';
import * as XLSX from 'xlsx';

const EXCEL_PATH = '/Users/intercomlanguageservices/Desktop/Master List.xlsx';
const SHEET_NAME = 'WA Cert Spanish'; // Change this for other languages
const LANGUAGE_NAME = 'Spanish'; // Must match the language in Supabase

const supabase = createClient();

console.log(`Reading Excel file: ${EXCEL_PATH}`);
console.log(`Target sheet: ${SHEET_NAME}`);
console.log(`Target language: ${LANGUAGE_NAME}\n`);

// Get the language ID for Spanish
const { data: language, error: langError } = await supabase
  .from('languages')
  .select('id, name')
  .eq('name', LANGUAGE_NAME)
  .single();

if (langError || !language) {
  console.error(`Failed to find language "${LANGUAGE_NAME}" in database`);
  process.exit(1);
}

const LANGUAGE_ID = language.id;
console.log(`Found language ID: ${LANGUAGE_ID}\n`);

// Read the Excel file
const workbook = XLSX.readFile(EXCEL_PATH);

if (!workbook.SheetNames.includes(SHEET_NAME)) {
  console.error(`Sheet "${SHEET_NAME}" not found in workbook.`);
  console.error('Available sheets:', workbook.SheetNames.join(', '));
  process.exit(1);
}

const sheet = workbook.Sheets[SHEET_NAME];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} rows in Excel sheet\n`);

let processed = 0;
let updated = 0;
let skipped = 0;
let notFound = 0;
let errors = 0;

for (const row of data as any[]) {
  const firstName = row['First Name']?.trim();
  const lastName = row['Last Name']?.trim();
  const preference = row['Preference'];

  if (!firstName || !lastName) {
    skipped++;
    continue;
  }

  // Skip if preference is missing, "x", or not a number
  if (!preference || preference === 'x' || preference === 'X') {
    skipped++;
    continue;
  }

  const preferenceNum = parseInt(preference, 10);
  if (isNaN(preferenceNum)) {
    console.log(`⏭️  Skipping ${firstName} ${lastName} - non-numeric preference: "${preference}"`);
    skipped++;
    continue;
  }

  processed++;

  // Find interpreter in Supabase by name
  const { data: interpreters, error: searchError } = await supabase
    .from('interpreters')
    .select('id, first_name, last_name')
    .ilike('first_name', firstName)
    .ilike('last_name', lastName);

  if (searchError) {
    console.error(`❌ Error searching for ${firstName} ${lastName}:`, searchError.message);
    errors++;
    continue;
  }

  if (!interpreters || interpreters.length === 0) {
    console.log(`❓ Not found in database: ${firstName} ${lastName}`);
    notFound++;
    continue;
  }

  if (interpreters.length > 1) {
    console.log(`⚠️  Multiple matches for ${firstName} ${lastName} - using first match`);
  }

  const interpreter = interpreters[0];

  // Update preference_rank in interpreter_languages table
  const { error: updateError } = await supabase
    .from('interpreter_languages')
    .update({ preference_rank: preferenceNum })
    .eq('interpreter_id', interpreter.id)
    .eq('language_id', LANGUAGE_ID);

  if (updateError) {
    console.error(`❌ Error updating ${firstName} ${lastName}:`, updateError.message);
    errors++;
    continue;
  }

  console.log(`✅ Updated ${firstName} ${lastName}: preference_rank = ${preferenceNum}`);
  updated++;
}

console.log('\n=== Sync Complete ===');
console.log(`Total rows in Excel: ${data.length}`);
console.log(`Processed: ${processed}`);
console.log(`✅ Successfully updated: ${updated}`);
console.log(`⏭️  Skipped (empty/x/text preference): ${skipped}`);
console.log(`❓ Not found in database: ${notFound}`);
console.log(`❌ Errors: ${errors}`);
