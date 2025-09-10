import { supabase } from '../lib/supabase.js';

export async function getInterpreterById(languageId){
  try{
    const { data, error} = await supabase
      .from('interpreters')
      .select(`id, first_name, last_name, interpreter_languages!inner(language_id)`)
  .eq('interpreter_languages.language_id', languageId);
    if (error){
      console.error('Error fetching interpreter by ID:', error);
      return[];
    }
    return data;
  } catch (error){
    console.error('An unexpected error occurred:', error.message);
    return [];
  }
}

export async function getAllInterpreters() {
  try {
    const { data, error } = await supabase
      .from('interpreters')
      .select('*'); // The '*' selects all columns from the table

    if (error) {
      console.error('Error fetching all interpreters:', error);
      return []; // Return an empty array on error
    }

    return data;
  } catch (err) {
    console.error('An unexpected error occurred:', err.message);
    return [];
  }
}