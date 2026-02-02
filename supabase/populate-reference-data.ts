#!/usr/bin/env bun
/**
 * Populate Supabase Reference Data for Interlingo
 * Run this script ONCE before activating the n8n workflow
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anqfdvyhexpxdpgbkgmd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucWZkdnloZXhweGRwZ2JrZ21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzUyNTYsImV4cCI6MjA2NTE1MTI1Nn0.VMUTXMtzBb4_PB5BLuUyv-AlStakV2oF97E6pYrdKAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Populating Interlingo Reference Data...\n');

// Common organizations in Washington state
const organizations = [
  { name: 'Fife Municipal Court', abbreviation: 'FIFE', city: 'Fife', state: 'WA' },
  { name: 'Kent Municipal Court', abbreviation: 'KENT', city: 'Kent', state: 'WA' },
  { name: 'Puyallup Municipal Court', abbreviation: 'PUYALLUP', city: 'Puyallup', state: 'WA' },
  { name: 'Auburn Municipal Court', abbreviation: 'AUBURN', city: 'Auburn', state: 'WA' },
  { name: 'Federal Way Municipal Court', abbreviation: 'FED WAY', city: 'Federal Way', state: 'WA' },
  { name: 'Renton Municipal Court', abbreviation: 'RENTON', city: 'Renton', state: 'WA' },
  { name: 'SeaTac Municipal Court', abbreviation: 'SEATAC', city: 'SeaTac', state: 'WA' },
  { name: 'Tukwila Municipal Court', abbreviation: 'TUKWILA', city: 'Tukwila', state: 'WA' },
  { name: 'Des Moines Municipal Court', abbreviation: 'DES MOINES', city: 'Des Moines', state: 'WA' },
  { name: 'Tacoma Municipal Court', abbreviation: 'TACOMA', city: 'Tacoma', state: 'WA' }
];

// Court programs / meeting types
const courtPrograms = [
  { name: 'ARR', description: 'Arraignment' },
  { name: 'PEI', description: 'Pre-Examination Interview' },
  { name: 'PRETRIAL', description: 'Pretrial Hearing' },
  { name: 'TRIAL', description: 'Trial' },
  { name: 'SENTENCING', description: 'Sentencing Hearing' },
  { name: 'REVIEW', description: 'Review Hearing' },
  { name: 'STATUS', description: 'Status Conference' },
  { name: 'MOTION', description: 'Motion Hearing' }
];

async function populateOrganizations() {
  console.log('📍 Populating Organizations...');

  for (const org of organizations) {
    // Check if exists
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('abbreviation', org.abbreviation)
      .single();

    if (existing) {
      console.log(`  ✓ ${org.abbreviation} already exists`);
      continue;
    }

    // Insert new
    const { data, error } = await supabase
      .from('organizations')
      .insert(org)
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Failed to create ${org.abbreviation}:`, error.message);
    } else {
      console.log(`  ✓ Created ${org.abbreviation} (${data.id})`);

      // Also create a default location for this org
      await createLocationForOrg(data.id, org);
    }
  }
}

async function createLocationForOrg(orgId: string, org: any) {
  // Check if location exists
  const { data: existing } = await supabase
    .from('locations')
    .select('id')
    .eq('organization_id', orgId)
    .single();

  if (existing) return;

  // Create location
  const { data, error } = await supabase
    .from('locations')
    .insert({
      organization_id: orgId,
      name: org.name,
      address: `${org.city}, ${org.state}`,
      city: org.city,
      state: org.state,
      zoom_link: null,
      zoom_login: null
    })
    .select()
    .single();

  if (error) {
    console.error(`    ✗ Failed to create location for ${org.abbreviation}:`, error.message);
  } else {
    console.log(`    ✓ Created default location for ${org.abbreviation}`);
  }
}

async function populateCourtPrograms() {
  console.log('\n⚖️  Populating Court Programs...');

  for (const program of courtPrograms) {
    // Check if exists
    const { data: existing } = await supabase
      .from('court_programs')
      .select('id')
      .eq('name', program.name)
      .single();

    if (existing) {
      console.log(`  ✓ ${program.name} already exists`);
      continue;
    }

    // Insert new
    const { data, error } = await supabase
      .from('court_programs')
      .insert(program)
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Failed to create ${program.name}:`, error.message);
    } else {
      console.log(`  ✓ Created ${program.name}`);
    }
  }
}

async function verifyLanguages() {
  console.log('\n🌐 Verifying Languages...');

  const { count, error } = await supabase
    .from('languages')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('  ✗ Error checking languages:', error.message);
    return;
  }

  console.log(`  ✓ Found ${count} languages in database`);

  // Check for common languages
  const commonLanguages = ['Spanish', 'ASL', 'Russian', 'Vietnamese', 'Mandarin', 'Arabic'];

  for (const lang of commonLanguages) {
    const { data } = await supabase
      .from('languages')
      .select('id, name')
      .ilike('name', lang)
      .single();

    if (data) {
      console.log(`  ✓ ${lang} exists (${data.id})`);
    } else {
      console.log(`  ⚠️  ${lang} NOT FOUND - You may need to add it manually`);
    }
  }
}

async function main() {
  try {
    await populateOrganizations();
    await populateCourtPrograms();
    await verifyLanguages();

    console.log('\n✅ Reference data population complete!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Review the data in Supabase dashboard');
    console.log('  2. Add any missing organizations or programs');
    console.log('  3. Configure your n8n workflow credentials');
    console.log('  4. Test the workflow with a sample calendar event');

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();
