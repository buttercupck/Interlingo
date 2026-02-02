import { createClient } from '../lib/supabase/client';
import * as XLSX from 'xlsx';

const EXCEL_PATH = '/Users/intercomlanguageservices/Desktop/Master List.xlsx';
const SHEET_NAME = 'WA Cert Spanish';
const LANGUAGE_NAME = 'Spanish';

const supabase = createClient();

console.log(`Reading Excel file: ${EXCEL_PATH}`);
console.log(`Target sheet: ${SHEET_NAME}`);
console.log(`Target language: ${LANGUAGE_NAME}\n`);

// Get the language ID
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

let imported = 0;
let skipped = 0;
let errors = 0;

for (const row of data as any[]) {
  const firstName = row['First Name']?.trim();
  const lastName = row['Last Name']?.trim();
  const licenseNumber = row['License No.']?.toString().trim();
  const phone = row['Phone']?.toString().trim();
  const email = row['Email']?.trim();
  const city = row['City']?.trim();
  const state = row['State']?.trim();
  const timezone = row['Time Zone']?.trim();
  const isLocal = row['Local Y/N']?.toString().toLowerCase() === 'y';
  const preference = row['Preference'];

  if (!firstName || !lastName) {
    skipped++;
    continue;
  }

  // Check if interpreter already exists
  const { data: existing } = await supabase
    .from('interpreters')
    .select('id')
    .ilike('first_name', firstName)
    .ilike('last_name', lastName);

  if (existing && existing.length > 0) {
    console.log(`⏭️  Already exists: ${firstName} ${lastName}`);
    skipped++;
    continue;
  }

  // Parse preference rating
  let preferenceRating: number | null = null;
  if (preference && preference !== 'x' && preference !== 'X') {
    const parsed = parseInt(preference, 10);
    if (!isNaN(parsed)) {
      preferenceRating = parsed;
    }
  }

  // Insert interpreter
  const { data: newInterpreter, error: interpreterError } = await supabase
    .from('interpreters')
    .insert({
      first_name: firstName,
      last_name: lastName,
      license_number: licenseNumber || null,
      phone: phone || null,
      email: email || null,
      city: city || null,
      state: state || null,
      timezone: timezone || null,
      is_local: isLocal,
      modality_preferences: [], // Will be filled in later
    })
    .select()
    .single();

  if (interpreterError || !newInterpreter) {
    console.error(`❌ Failed to import ${firstName} ${lastName}:`, interpreterError?.message);
    errors++;
    continue;
  }

  // Determine certification from sheet context (WA Cert Spanish = all Certified)
  // You can modify this logic if the Excel has a certification column
  const certification = 'Certified';

  // Insert interpreter_languages record (without preference_rating for now)
  const { error: langError } = await supabase
    .from('interpreter_languages')
    .insert({
      interpreter_id: newInterpreter.id,
      language_id: LANGUAGE_ID,
      certification: certification,
      proficiency_rank: 1, // Default rank
      // preference_rating will be synced separately once column is added
    });

  if (langError) {
    console.error(`❌ Failed to link language for ${firstName} ${lastName}:`, langError.message);
    // Rollback interpreter insert
    await supabase.from('interpreters').delete().eq('id', newInterpreter.id);
    errors++;
    continue;
  }

  const prefStr = preferenceRating !== null ? ` (pref: ${preferenceRating})` : '';
  console.log(`✅ Imported: ${firstName} ${lastName}${prefStr}`);
  imported++;
}

console.log('\n=== Import Complete ===');
console.log(`Total rows in Excel: ${data.length}`);
console.log(`✅ Successfully imported: ${imported}`);
console.log(`⏭️  Skipped (already exist): ${skipped}`);
console.log(`❌ Errors: ${errors}`);
