import { createClient } from '../lib/supabase/client';

const supabase = createClient();

console.log('=== Checking Spanish Language ===');
const { data: spanish, error: spanishError } = await supabase
  .from('languages')
  .select('id, name')
  .eq('name', 'Spanish')
  .single();

if (spanishError) {
  console.error('Spanish error:', spanishError);
} else {
  console.log('Spanish ID:', spanish?.id);
}

console.log('\n=== Checking Renton Organization ===');
const { data: rentonOrg, error: orgError } = await supabase
  .from('organizations')
  .select('id, name, abbreviation')
  .ilike('name', '%renton%');

if (orgError) {
  console.error('Org error:', orgError);
} else {
  console.log('Renton orgs:', rentonOrg);
}

console.log('\n=== Checking Renton Locations ===');
const { data: rentonLocs, error: locsError } = await supabase
  .from('locations')
  .select('id, name, zoom_link, zoom_login, org_id, organization:organizations(name)')
  .ilike('name', '%renton%');

if (locsError) {
  console.error('Locations error:', locsError);
} else {
  console.log('Renton locations:', JSON.stringify(rentonLocs, null, 2));
}
