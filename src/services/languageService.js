import { supabase } from '../lib/supabase.js'; 

export async function getLanguages() {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*'); 

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching languages:', error.message);
    return null;
  }
}