import { supabase } from '../lib/supabase.js';

export async function getFilteredYPrioritizedInpterpreters(languageId, modality, startTime, endTime, jobCity, jobState ){
  console.log("--- Starting Interpreter Fetch ---"); // ADD THIS
  console.log("Input Params:", { languageId, modality, startTime, endTime, jobCity, jobState }); // ADD THIS
try {
    // 1. Fetch busy interpreters
    const { data: busyInterpreters, error: busyError } = await supabase
      .from('commitment_blocks')
      .select('interpreter_id')
      .not('status', 'eq', 'Canceled') // Corrected 'Cancelled' to 'Canceled'
      .filter('interpreter_id', 'not.is', null) // Corrected 'null' string to null
      .or(`and(start_time.lte.${endTime}, end_time.gte.${startTime})`);

    if (busyError) {
      throw busyError;
    }

    const busyInterpreterIds = busyInterpreters.map(b => b.interpreter_id);

    // 2. Fetch available interpreters (without DB ordering, will sort in JS)
    let query = supabase
      .from('interpreters')
      .select(`
        id, 
        first_name, 
        last_name, 
        internal_notes, 
        is_local, 
        modality_preferences,
        city,                 
        state,                
        interpreter_languages!inner(language_id, certification, proficiency_rank)
      `) // Explicitly listed fields for clarity and consistency
      .eq('interpreter_languages.language_id', languageId);
  // --- TEMPORARY LOGGING ---
  // Execute this temporary query to see interpreters after ONLY language filter
  const { data: afterLanguageFilter, error: langFilterError } = await query.limit(100); // Limit to avoid huge logs
  if (langFilterError) console.error("Error after language filter:", langFilterError);
  console.log("Interpreters after ONLY language filter (before busy/modality):", afterLanguageFilter.map(i => ({id: i.id, name: i.first_name, langs: i.interpreter_languages}))); // ADD THIS
  // --- END TEMPORARY LOGGING ---

    // 3. Filter out busy interpreters
    if (busyInterpreterIds.length > 0) {
      query = query.not('id', 'in', busyInterpreterIds);
    }

  // --- TEMPORARY LOGGING ---
  const { data: afterBusyFilter, error: busyFilterError } = await query.limit(100);
  if (busyFilterError) console.error("Error after busy filter:", busyFilterError);
  console.log("Interpreters after BUSY filter:", afterBusyFilter.map(i => ({id: i.id, name: i.first_name}))); // ADD THIS
  // --- END TEMPORARY LOGGING ---


    // 4. Filter by modality and job location
    if (modality === 'In-Person') {
      query = query
        .eq('city', jobCity)
        .eq('state', jobState);
      console.log("Applying In-Person filter for:", { jobCity, jobState }); // ADD THIS
    } else {
      query = query.contains('modality_preferences', [modality]);
      console.log("Applying remote modality filter for:", modality); // ADD THIS
    }

    // 5. Execute the query to get available interpreters (unsorted from DB)
    const { data: fetchedAvailable, error: availableError } = await query; // Removed .order() here
    if (availableError) {
      console.error("Error fetching AVAILABLE interpreters (main query):", availableError); // ADD THIS
      throw availableError;
    }
  console.log("Fetched AVAILABLE interpreters (before JS sort):", fetchedAvailable.map(i => ({id: i.id, name: i.first_name, jobCity: i.city, jobState: i.state, mods: i.modality_preferences})));

    // 6. Sort AVAILABLE interpreters in JavaScript
    const available = fetchedAvailable.sort((a, b) => {
      const rankA = a.interpreter_languages?.[0]?.proficiency_rank || Infinity;
      const rankB = b.interpreter_languages?.[0]?.proficiency_rank || Infinity;
      return rankA - rankB;
    });
   console.log("Final JS-sorted AVAILABLE interpreters:", available.map(i => ({id: i.id, name: i.first_name}))); // ADD THIS
    // 7. Fetch List of all relevant interpreters (for unavailable calculation)
    const { data: fetchedAllRelevant, error: allRelevantError } = await supabase
      .from('interpreters')
      .select(`
        id, 
        first_name, 
        last_name, 
        internal_notes, 
        is_local, 
        modality_preferences,
        city,                 
        state,                
        interpreter_languages!inner(language_id, proficiency_rank, certification)
      `) // Explicitly listed fields for clarity and consistency
      .eq('interpreter_languages.language_id', languageId);

    if (allRelevantError) {
      console.error("Error fetching ALL RELEVANT interpreters (for unavailable check):", allRelevantError); // ADD THIS
      throw allRelevantError;
    }

    // 8. Sort ALL RELEVANT interpreters in JavaScript
    const allRelevantInterpreters = fetchedAllRelevant.sort((a, b) => {
      const rankA = a.interpreter_languages?.[0]?.proficiency_rank || Infinity;
      const rankB = b.interpreter_languages?.[0]?.proficiency_rank || Infinity;
      return rankA - rankB;
    });
  console.log("All relevant interpreters (for unavailable calculation, JS-sorted):", allRelevantInterpreters.map(i => ({id: i.id, name: i.first_name, city: i.city, state: i.state, mods: i.modality_preferences}))); // ADD THIS
    const unavailable = allRelevantInterpreters.filter(interpreter => 
        busyInterpreterIds.includes(interpreter.id) ||
        (modality === 'In-Person' && (interpreter.city !== jobCity || interpreter.state !== jobState)) ||
        (modality !== 'In-Person' && !interpreter.modality_preferences?.includes(modality)) // Added optional chaining
    );
  console.log("Final UNAVAILABLE interpreters:", unavailable.map(i => ({id: i.id, name: i.first_name}))); // ADD THIS
    return { available, unavailable };

  } catch (error) {
    console.error('Error fetching interpreters:', error.message);
    return { available: [], unavailable: [] };
  }
}