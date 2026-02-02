import { createClient } from '../lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase
  .from('interpreters')
  .select('id, first_name, last_name, preference_rating')
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Sample interpreters in Supabase:');
  console.table(data);

  const { count } = await supabase
    .from('interpreters')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal interpreters in database: ${count}`);
}
