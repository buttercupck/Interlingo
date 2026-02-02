#!/usr/bin/env bun
/**
 * Extract alphabetical batch from clean CSV
 * V2: Handles quoted CSV properly
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const [startLetter, endLetter] = process.argv.slice(2);

if (!startLetter || !endLetter) {
  console.error('Usage: bun extract-batch-v2.ts <start-letter> <end-letter>');
  console.error('Example: bun extract-batch-v2.ts A C');
  process.exit(1);
}

const inputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters-clean.csv';
const outputPath = `/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/batch-${startLetter}-${endLetter}.csv`;

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

const start = startLetter.toUpperCase();
const end = endLetter.toUpperCase();

const batchRecords = records.filter((record: any) => {
  const lastName = record.last_name?.trim();

  if (!lastName) return false;

  const firstChar = lastName.charAt(0).toUpperCase();
  return firstChar >= start && firstChar <= end;
});

const output = stringify(batchRecords, {
  header: true,
  quoted: true,
  quoted_empty: true,
  escape: '"'
});

await Bun.write(outputPath, output);

console.log(`✅ Extracted ${batchRecords.length} records (${start}-${end})`);
console.log(`📁 Output: ${outputPath}`);

// Show first 5 for preview
console.log('\n📋 First 5 records:');
for (let i = 0; i < Math.min(5, batchRecords.length); i++) {
  const record: any = batchRecords[i];
  console.log(`${i + 1}. ${record.first_name} ${record.last_name}`);
}
