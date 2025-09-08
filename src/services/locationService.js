import { supabase } from '../lib/supabase.js';

export async function getLocationsByOrgId(orgId){
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('org_id', orgId)
  if (error){
      throw error;
  }
  return data;
  } catch (error) {
    console.error('Error fetching locations for organization ${orgId}:', error.message);
  return null;
  }
}