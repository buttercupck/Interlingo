import { supabase } from '../lib/supabase.js'; 

export async function getPrograms() {
  try {
    const { data, error } = await supabase
      .from('court_programs') 
      .select('*'); 

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching court programs:', error.message);
    return null; 
  }
}