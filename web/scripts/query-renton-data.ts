import { createClient } from '../lib/supabase/client';

const supabase = createClient();

// Get Spanish language ID
const { data: spanish, error: spanishError } = await supabase
  .from('languages')
  .select('id, name')
  .eq('name', 'Spanish')
  .single();

if (spanishError) {
  console.error('Spanish error:', spanishError);
} else {
  console.log('Spanish:', spanish);
}

// Get Renton organization
const { data: renton, error: rentonError } = await supabase
  .from('organizations')
  .select('id, name')
  .ilike('name', '%renton%');

if (rentonError) {
  console.error('Renton error:', rentonError);
} else {
  console.log('Renton orgs:', renton);
}

// Get Renton locations
const { data: rentonLocs, error: locsError } = await supabase
  .from('locations')
  .select('*, organization:organizations(*)')
  .ilike('name', '%renton%');

if (locsError) {
  console.error('Locations error:', locsError);
} else {
  console.log('Renton locations:', rentonLocs);
}
