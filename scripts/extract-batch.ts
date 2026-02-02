#!/usr/bin/env bun
/**
 * Extract alphabetical batch from clean CSV
 * Usage: bun extract-batch.ts A C
 */

const [startLetter, endLetter] = process.argv.slice(2);

if (!startLetter || !endLetter) {
  console.error('Usage: bun extract-batch.ts <start-letter> <end-letter>');
  console.error('Example: bun extract-batch.ts A C');
  process.exit(1);
}

const inputPath = '/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/reconciled-interpreters-clean.csv';
const outputPath = `/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/scripts/batch-${startLetter}-${endLetter}.csv`;

const input = await Bun.file(inputPath).text();
const lines = input.split('\n');

const header = lines[0];
const dataLines = lines.slice(1);

const start = startLetter.toUpperCase();
const end = endLetter.toUpperCase();

const batchLines = dataLines.filter(line => {
  if (!line.trim()) return false;

  const fields = line.split(',');
  const lastName = fields[1]?.trim();

  if (!lastName) return false;

  const firstChar = lastName.charAt(0).toUpperCase();
  return firstChar >= start && firstChar <= end;
});

const output = [header, ...batchLines].join('\n');
await Bun.write(outputPath, output);

console.log(`✅ Extracted ${batchLines.length} records (${start}-${end})`);
console.log(`📁 Output: ${outputPath}`);

// Show first 5 for preview
console.log('\n📋 First 5 records:');
for (let i = 0; i < Math.min(5, batchLines.length); i++) {
  const fields = batchLines[i].split(',');
  console.log(`${i + 1}. ${fields[0]} ${fields[1]}`);
}
