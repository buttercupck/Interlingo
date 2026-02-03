#!/usr/bin/env bun

/**
 * Organization Config Sync Service
 *
 * Syncs markdown organization configs from ../Intercom/instructions/organizations/
 * to Supabase organizations table (zoom_instructions, in_person_instructions, phone_instructions)
 *
 * Usage: bun run services/org-config-sync.ts
 * Usage (specific org): bun run services/org-config-sync.ts Kent-Municipal-Court
 */

import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  console.error('   Set in web/.env.local or export SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface OrgConfig {
  uuid: string;
  abbreviation: string;
  name: string;
  zoom_instructions?: string | null;
  in_person_instructions?: string | null;
  phone_instructions?: string | null;
}

interface SyncReport {
  success: string[];
  errors: Array<{ file: string; error: string }>;
  skipped: string[];
}

/**
 * Extract instruction section from markdown content by heading
 */
function extractInstructionSection(content: string, heading: string): string | null {
  // Match heading (## Zoom Instructions, ## In-Person Instructions, etc.)
  const headingPattern = new RegExp(`^##\\s+${heading}\\s*Instructions?\\s*$`, 'mi');
  const headingMatch = content.match(headingPattern);

  if (!headingMatch || headingMatch.index === undefined) {
    return null;
  }

  const startIndex = headingMatch.index + headingMatch[0].length;

  // Find next ## heading or end of content
  const nextHeadingPattern = /^##\s+/m;
  const remainingContent = content.slice(startIndex);
  const nextHeadingMatch = remainingContent.match(nextHeadingPattern);

  const endIndex = nextHeadingMatch && nextHeadingMatch.index !== undefined
    ? startIndex + nextHeadingMatch.index
    : content.length;

  return content.slice(startIndex, endIndex).trim();
}

/**
 * Preprocess instructions: remove metadata, keep placeholders
 */
function preprocessInstructions(raw: string): string {
  return raw
    // Remove wikilinks [[like this]]
    .replace(/\[\[([^\]]+)\]\]/g, '')
    // Remove **Template Used:** lines
    .replace(/\*\*Template Used:\*\*.*/g, '')
    // Remove **Base:** lines
    .replace(/\*\*Base:\*\*.*/g, '')
    // Remove **subject-line:** lines
    .replace(/\*\*subject-line:\*\*.*/g, '')
    // Remove **HTML Email Template:** lines
    .replace(/\*\*HTML Email Template:\*\*.*/g, '')
    // Remove **Substitution Rules:** sections
    .replace(/\*\*Substitution Rules:\*\*[\s\S]*?(?=\n\n|\n---|$)/g, '')
    // Remove organization-specific metadata blocks
    .replace(/\*\*Organization-Specific Instructions:\*\*/g, '')
    // Keep placeholders intact: [Language Name], [Interpreter Full Name]
    // Keep markdown formatting (bold, lists) - will be cleaned at render time
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse org markdown file and extract config
 */
function parseOrgMarkdown(filePath: string): OrgConfig | null {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Extract required frontmatter fields
    const uuid = frontmatter.organization_uuid;
    const abbreviation = frontmatter.abbreviation;
    const name = frontmatter.organization_name;

    if (!uuid || !abbreviation || !name) {
      throw new Error(`Missing required frontmatter: uuid=${uuid}, abbr=${abbreviation}, name=${name}`);
    }

    // Extract instruction sections
    const zoomRaw = extractInstructionSection(content, 'Zoom');
    const inPersonRaw = extractInstructionSection(content, 'In-Person') || extractInstructionSection(content, 'In Person');
    const phoneRaw = extractInstructionSection(content, 'Phone');

    // Preprocess instructions
    const zoom_instructions = zoomRaw ? preprocessInstructions(zoomRaw) : null;
    const in_person_instructions = inPersonRaw ? preprocessInstructions(inPersonRaw) : null;
    const phone_instructions = phoneRaw ? preprocessInstructions(phoneRaw) : null;

    return {
      uuid,
      abbreviation,
      name,
      zoom_instructions,
      in_person_instructions,
      phone_instructions,
    };
  } catch (error) {
    console.error(`❌ Parse error in ${filePath}:`, error);
    return null;
  }
}

/**
 * Sync org config to Supabase
 */
async function syncToDatabase(config: OrgConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('organizations')
      .upsert({
        id: config.uuid,
        name: config.name,
        abbreviation: config.abbreviation,
        zoom_instructions: config.zoom_instructions,
        in_person_instructions: config.in_person_instructions,
        phone_instructions: config.phone_instructions,
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sync all org configs
 */
async function syncAllOrgs(): Promise<SyncReport> {
  const report: SyncReport = {
    success: [],
    errors: [],
    skipped: [],
  };

  // Path to org config markdown files
  const orgConfigDir = join(process.cwd(), '..', 'Intercom', 'instructions', 'organizations');

  console.log(`\n📂 Reading org configs from: ${orgConfigDir}\n`);

  // Get all Org-*.md files
  const files = readdirSync(orgConfigDir).filter(f => f.startsWith('Org-') && f.endsWith('.md'));

  console.log(`Found ${files.length} org config files\n`);

  for (const file of files) {
    const filePath = join(orgConfigDir, file);

    console.log(`🔄 Processing: ${file}`);

    // Parse markdown
    const config = parseOrgMarkdown(filePath);

    if (!config) {
      report.skipped.push(file);
      console.log(`   ⚠️  Skipped (parse error)\n`);
      continue;
    }

    // Sync to database
    const result = await syncToDatabase(config);

    if (result.success) {
      report.success.push(file);
      console.log(`   ✅ Synced: ${config.name} (${config.abbreviation})`);
      if (config.zoom_instructions) console.log(`      - Zoom: ${config.zoom_instructions.length} chars`);
      if (config.in_person_instructions) console.log(`      - In-Person: ${config.in_person_instructions.length} chars`);
      if (config.phone_instructions) console.log(`      - Phone: ${config.phone_instructions.length} chars`);
      console.log('');
    } else {
      report.errors.push({ file, error: result.error || 'Unknown error' });
      console.log(`   ❌ Error: ${result.error}\n`);
    }
  }

  return report;
}

/**
 * Sync specific org by file name
 */
async function syncSpecificOrg(orgFileName: string): Promise<void> {
  const orgConfigDir = join(process.cwd(), '..', 'Intercom', 'instructions', 'organizations');
  const filePath = join(orgConfigDir, `Org-${orgFileName}.md`);

  console.log(`\n🔄 Syncing specific org: ${orgFileName}\n`);

  const config = parseOrgMarkdown(filePath);

  if (!config) {
    console.error('❌ Failed to parse org config');
    process.exit(1);
  }

  console.log(`📋 Parsed: ${config.name} (${config.abbreviation})`);
  console.log(`   UUID: ${config.uuid}`);
  if (config.zoom_instructions) console.log(`   Zoom: ${config.zoom_instructions.length} chars`);
  if (config.in_person_instructions) console.log(`   In-Person: ${config.in_person_instructions.length} chars`);
  if (config.phone_instructions) console.log(`   Phone: ${config.phone_instructions.length} chars`);

  const result = await syncToDatabase(config);

  if (result.success) {
    console.log(`\n✅ Successfully synced ${config.name} to database`);
  } else {
    console.error(`\n❌ Failed to sync: ${result.error}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const specificOrg = process.argv[2];

  if (specificOrg) {
    await syncSpecificOrg(specificOrg);
  } else {
    console.log('🔄 Organization Config Sync Service');
    console.log('=====================================\n');

    const report = await syncAllOrgs();

    console.log('\n📊 SYNC REPORT');
    console.log('=============');
    console.log(`✅ Success: ${report.success.length}`);
    console.log(`❌ Errors: ${report.errors.length}`);
    console.log(`⚠️  Skipped: ${report.skipped.length}`);

    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
      process.exit(1);
    }
  }
}

main();
