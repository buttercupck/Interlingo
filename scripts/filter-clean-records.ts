#!/usr/bin/env bun
/**
 * Filter reconciled CSV to only complete records (both first and last name)
 */

const inputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters.csv';
const outputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters-clean.csv';

const input = await Bun.file(inputPath).text();
const lines = input.split('\n');

const header = lines[0];
const dataLines = lines.slice(1);

const cleanLines = dataLines.filter(line => {
  if (!line.trim()) return false;

  const fields = line.split(',');
  const firstName = fields[0]?.trim();
  const lastName = fields[1]?.trim();

  // Keep only if both first and last name are present
  return firstName && lastName && firstName !== '' && lastName !== '';
});

const output = [header, ...cleanLines].join('\n');
await Bun.write(outputPath, output);

console.log(`✅ Filtered ${dataLines.length} records to ${cleanLines.length} complete records`);
console.log(`📁 Output: ${outputPath}`);
