#!/usr/bin/env bun
/**
 * Interpreter Data Reconciliation Script
 *
 * Merges Excel "Master List" and Notion interpreter data into single CSV
 * for batch import into Supabase.
 *
 * Sources:
 * - Excel: /Users/intercomlanguageservices/Desktop/Master List.xlsx (Sheet: "WA Reg&Cert Interpreters")
 * - Notion: /Users/intercomlanguageservices/Downloads/notion_interpreter/interpreters_full.csv
 *
 * Output: reconciled-interpreters.csv
 */

import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// ============================================================================
// TYPES
// ============================================================================

interface ExcelInterpreter {
  Preferred?: string;
  Language?: string;
  '2nd Language'?: string;
  'First Name'?: string;
  'Last Name'?: string;
  'Cert or Reg'?: string;
  'License No.'?: string;
  City?: string;
  State?: string;
  'Time Zone'?: string;
  Phone?: string;
  Email?: string;
  Rate?: string;
  Notes?: string;
  'Additional Notes'?: string;
}

interface NotionInterpreter {
  Name?: string;
  'CHECK RATE w/ COURT'?: string;
  Email?: string;
  'In Person'?: string;
  Language?: string;
  Location?: string;
  'NO BOOKING FROM'?: string;
  Note?: string;
  OUT?: string;
  'PLEASE RECONFIRM'?: string;
  'Phone Number'?: string;
  Registration?: string;
  'Second.language'?: string;
  'Secondary Email'?: string;
  'Third Email'?: string;
  Timezone?: string;
}

interface LanguageData {
  name: string;
  certification: string;
}

interface ReconciledInterpreter {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  timezone: string;
  license_number: string;
  languages_json: string; // JSON array of LanguageData[]
  internal_notes: string;
  requires_reconfirmation: boolean;
  operational_metadata_json: string; // JSON object
  secondary_emails_json: string; // JSON array of strings
}

// ============================================================================
// DATA LOADING
// ============================================================================

function loadExcelData(): ExcelInterpreter[] {
  console.log('📖 Loading Excel data from Master List.xlsx...');

  const workbook = XLSX.readFile('/Users/intercomlanguageservices/Desktop/Master List.xlsx');
  const sheetName = 'WA Reg&Cert Interpreters';

  if (!workbook.Sheets[sheetName]) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  const data = XLSX.utils.sheet_to_json<ExcelInterpreter>(workbook.Sheets[sheetName]);
  console.log(`✅ Loaded ${data.length} records from Excel`);

  return data;
}

async function loadNotionData(): Promise<NotionInterpreter[]> {
  console.log('📖 Loading Notion data from interpreters_full.csv...');

  const csvContent = await Bun.file('/Users/intercomlanguageservices/Downloads/notion_interpreter/interpreters_full.csv').text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`📊 Loaded ${records.length} raw records from Notion`);

  // Filter out malformed address rows
  const cleaned = records.filter((row: NotionInterpreter) => {
    // Malformed rows have addresses in the Name field (e.g., "1220 Central Ave S, Kent, WA 98032")
    const name = row.Name || '';
    const hasCommaNumber = /^\d+/.test(name); // Starts with number
    const hasMultipleCommas = (name.match(/,/g) || []).length > 1; // Multiple commas

    return !(hasCommaNumber && hasMultipleCommas);
  });

  console.log(`✅ Cleaned ${records.length - cleaned.length} malformed rows, ${cleaned.length} valid records remain`);

  return cleaned;
}

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

function normalizeEmail(email?: string): string {
  return (email || '').toLowerCase().trim();
}

function parseName(notionName?: string): { first: string; last: string } {
  if (!notionName) return { first: '', last: '' };

  const parts = notionName.trim().split(/\s+/);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };

  // Last part is last name, everything else is first name
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');

  return { first, last };
}

function parseLanguages(excelLang1?: string, excelLang2?: string, notionLang?: string, excelCert?: string): LanguageData[] {
  const languages: LanguageData[] = [];

  // Excel languages (prioritized)
  if (excelLang1) {
    // Handle parenthetical notes like "Tigrinya (NOT Registered)"
    const match = excelLang1.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
    const langName = match ? match[1].trim() : excelLang1.trim();
    const certNote = match && match[2] ? match[2].trim() : '';

    let cert = excelCert || 'None';
    if (certNote.includes('NOT')) {
      cert = 'None';
    }

    languages.push({ name: langName, certification: cert });
  }

  if (excelLang2) {
    const match = excelLang2.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
    const langName = match ? match[1].trim() : excelLang2.trim();
    const certNote = match && match[2] ? match[2].trim() : '';

    let cert = 'None';
    if (certNote.includes('Registered') || certNote.includes('Cert')) {
      cert = excelCert || 'None';
    }

    languages.push({ name: langName, certification: cert });
  }

  // Notion languages (supplement if Excel didn't provide)
  if (!excelLang1 && notionLang) {
    const notionLangs = notionLang.split(',').map(l => l.trim()).filter(Boolean);
    for (const lang of notionLangs) {
      if (!languages.find(l => l.name.toLowerCase() === lang.toLowerCase())) {
        languages.push({ name: lang, certification: 'None' });
      }
    }
  }

  return languages;
}

function normalizeTimezone(excelTz?: string, notionTz?: string): string {
  // Excel has full names: "Pacific", "Central", "Eastern"
  // Notion has Yes/No where Yes = needs PST noted (interpreter is non-PST)

  if (excelTz) {
    return excelTz.trim();
  }

  // If Notion says "Yes", they need PST noted (meaning they're NOT in PST)
  // If Notion says "No", they're in PST
  if (notionTz === 'Yes') {
    return 'Non-PST'; // Mark for timezone notation in reminders
  }

  return 'Pacific'; // Default
}

function mergeNotes(excelNotes?: string, excelAdditional?: string, notionNote?: string): string {
  const parts: string[] = [];

  if (excelNotes) parts.push(excelNotes.trim().replace(/[\r\n]+/g, ' '));
  if (excelAdditional) parts.push(excelAdditional.trim().replace(/[\r\n]+/g, ' '));
  if (notionNote) parts.push(notionNote.trim().replace(/[\r\n]+/g, ' '));

  return parts.join(' | ');
}

// ============================================================================
// RECONCILIATION
// ============================================================================

function reconcileData(excelData: ExcelInterpreter[], notionData: NotionInterpreter[]): ReconciledInterpreter[] {
  console.log('\n🔄 Starting reconciliation...');

  const reconciled: ReconciledInterpreter[] = [];
  const matchedNotionEmails = new Set<string>();

  // Build Notion lookup by email
  const notionByEmail = new Map<string, NotionInterpreter>();
  for (const notion of notionData) {
    const email = normalizeEmail(notion.Email);
    if (email) {
      notionByEmail.set(email, notion);
    }
  }

  // Phase 1: Match Excel records with Notion by email
  for (const excel of excelData) {
    const excelEmail = normalizeEmail(excel.Email);
    const notion = excelEmail ? notionByEmail.get(excelEmail) : undefined;

    if (notion) {
      matchedNotionEmails.add(normalizeEmail(notion.Email));
    }

    // Merge the records
    const languages = parseLanguages(
      excel.Language,
      excel['2nd Language'],
      notion?.Language,
      excel['Cert or Reg']
    );

    const secondaryEmails: string[] = [];
    if (notion?.['Secondary Email']) secondaryEmails.push(notion['Secondary Email']);
    if (notion?.['Third Email']) secondaryEmails.push(notion['Third Email']);

    const operationalMetadata: Record<string, any> = {};
    if (notion?.['CHECK RATE w/ COURT'] === 'Yes') {
      operationalMetadata.check_rate_with_court = true;
    }
    if (notion?.['NO BOOKING FROM']) {
      operationalMetadata.no_booking_from_date = notion['NO BOOKING FROM'];
    }

    reconciled.push({
      first_name: excel['First Name'] || '',
      last_name: excel['Last Name'] || '',
      email: notion?.Email || excel.Email || '',
      phone: notion?.['Phone Number'] || excel.Phone || '',
      city: excel.City || '',
      state: excel.State || '',
      timezone: normalizeTimezone(excel['Time Zone'], notion?.Timezone),
      license_number: excel['License No.']?.toString() || '',
      languages_json: JSON.stringify(languages),
      internal_notes: mergeNotes(excel.Notes, excel['Additional Notes'], notion?.Note),
      requires_reconfirmation: notion?.['PLEASE RECONFIRM'] === 'Yes',
      operational_metadata_json: JSON.stringify(operationalMetadata),
      secondary_emails_json: JSON.stringify(secondaryEmails)
    });
  }

  // Phase 2: Add Notion-only records (non-credentialed interpreters)
  for (const notion of notionData) {
    const notionEmail = normalizeEmail(notion.Email);
    if (matchedNotionEmails.has(notionEmail)) {
      continue; // Already matched
    }

    const { first, last } = parseName(notion.Name);
    const languages = parseLanguages(undefined, undefined, notion.Language, notion.Registration);

    const secondaryEmails: string[] = [];
    if (notion['Secondary Email']) secondaryEmails.push(notion['Secondary Email']);
    if (notion['Third Email']) secondaryEmails.push(notion['Third Email']);

    const operationalMetadata: Record<string, any> = {};
    if (notion['CHECK RATE w/ COURT'] === 'Yes') {
      operationalMetadata.check_rate_with_court = true;
    }
    if (notion['NO BOOKING FROM']) {
      operationalMetadata.no_booking_from_date = notion['NO BOOKING FROM'];
    }

    reconciled.push({
      first_name: first,
      last_name: last,
      email: notion.Email || '',
      phone: notion['Phone Number'] || '',
      city: notion.Location || '',
      state: '',
      timezone: normalizeTimezone(undefined, notion.Timezone),
      license_number: '',
      languages_json: JSON.stringify(languages),
      internal_notes: notion.Note || '',
      requires_reconfirmation: notion['PLEASE RECONFIRM'] === 'Yes',
      operational_metadata_json: JSON.stringify(operationalMetadata),
      secondary_emails_json: JSON.stringify(secondaryEmails)
    });
  }

  console.log(`✅ Reconciled ${reconciled.length} total interpreters`);
  console.log(`   - ${excelData.length} from Excel (credentialed)`);
  console.log(`   - ${reconciled.length - excelData.length} from Notion only (non-credentialed)`);

  return reconciled;
}

// ============================================================================
// CSV OUTPUT
// ============================================================================

function writeCSV(data: ReconciledInterpreter[], outputPath: string): void {
  console.log(`\n📝 Writing CSV to ${outputPath}...`);

  const rows = data.map(row => ({
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    state: row.state,
    timezone: row.timezone,
    license_number: row.license_number,
    languages_json: row.languages_json,
    internal_notes: row.internal_notes,
    requires_reconfirmation: row.requires_reconfirmation.toString(),
    operational_metadata_json: row.operational_metadata_json,
    secondary_emails_json: row.secondary_emails_json
  }));

  const csvContent = stringify(rows, {
    header: true,
    quoted: true,
    quoted_empty: true,
    escape: '"'
  });

  Bun.write(outputPath, csvContent);
  console.log(`✅ CSV written successfully (${data.length} records)`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Interpreter Data Reconciliation Script\n');

  try {
    // Load data
    const excelData = loadExcelData();
    const notionData = await loadNotionData();

    // Reconcile
    const reconciled = reconcileData(excelData, notionData);

    // Sort alphabetically by last name for batch processing
    reconciled.sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Output
    const outputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters.csv';
    writeCSV(reconciled, outputPath);

    // Show first 10 for preview
    console.log('\n📋 First 10 records (preview):');
    console.log('─'.repeat(80));
    for (let i = 0; i < Math.min(10, reconciled.length); i++) {
      const r = reconciled[i];
      const langs = JSON.parse(r.languages_json);
      console.log(`${i + 1}. ${r.first_name} ${r.last_name}`);
      console.log(`   Email: ${r.email}`);
      console.log(`   Phone: ${r.phone}`);
      console.log(`   Languages: ${langs.map((l: LanguageData) => `${l.name} (${l.certification})`).join(', ')}`);
      console.log(`   Timezone: ${r.timezone}`);
      console.log(`   Reconfirm: ${r.requires_reconfirmation}`);
      console.log(`   License: ${r.license_number || 'N/A'}`);
      console.log('');
    }

    console.log('\n✅ Reconciliation complete!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Total records: ${reconciled.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
