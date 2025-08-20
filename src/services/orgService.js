import {supabase} from '../lib/supabase.js'

export async function getOrgs() {
  try {
    const { data, error} = await supabase
      .from('organizations')
      .select('*');
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}
  