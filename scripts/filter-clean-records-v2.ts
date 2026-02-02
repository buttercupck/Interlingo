#!/usr/bin/env bun
/**
 * Filter reconciled CSV to only complete records (both first and last name)
 * V2: Handles quoted CSV properly
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const inputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters.csv';
const outputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters-clean.csv';

const input = await Bun.file(inputPath).text();
const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
  relax_column_count_more: true,
  escape: '"',
  quote: '"'
});

const cleanRecords = records.filter((record: any) => {
  const firstName = record.first_name?.trim();
  const lastName = record.last_name?.trim();

  // Keep only if both first and last name are present
  return firstName && lastName && firstName !== '' && lastName !== '';
});

const output = stringify(cleanRecords, {
  header: true,
  quoted: true,
  quoted_empty: true,
  escape: '"'
});

await Bun.write(outputPath, output);

console.log(`✅ Filtered ${records.length} records to ${cleanRecords.length} complete records`);
console.log(`📁 Output: ${outputPath}`);
