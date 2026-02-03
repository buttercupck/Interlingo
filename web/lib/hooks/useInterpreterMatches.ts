import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Interpreter, JobWithDetails } from '@/types/database.types';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
  preferenceRank: number | null;
}

/**
 * Implements the interpreter matching algorithm based on documented business rules:
 * 1. Filter by Language (must be registered or certified in the language)
 * 2. Filter by Modality (must support the modality, In-Person requires local)
 * 3. Prioritize by Certification (Certified > Registered > Neither)
 */
export function useInterpreterMatches(job: JobWithDetails | undefined) {
  return useQuery({
    queryKey: ['interpreterMatches', job?.id],
    queryFn: async () => {
      if (!job || !job.client_requests || job.client_requests.length === 0) {
        return { matches: [], unavailable: [] };
      }

      const supabase = createClient();
      const firstRequest = job.client_requests[0];

      const languageId = firstRequest && 'language' in firstRequest && firstRequest.language
        ? firstRequest.language.id
        : null;

      if (!languageId) {
        throw new Error('Job language is required for matching');
      }

      // Fetch interpreters filtered server-side by language and certification
      // Using !inner makes this an INNER JOIN, only returning interpreters with matching language certifications
      const { data: interpreters, error } = await supabase
        .from('interpreters')
        .select(`
          *,
          interpreter_languages!inner (
            language_id,
            certification,
            proficiency_rank,
            preference_rank
          )
        `)
        .eq('interpreter_languages.language_id', languageId)
        .in('interpreter_languages.certification', ['Certified', 'Registered']);

      if (error) {
        throw new Error(error.message);
      }

      const matches: InterpreterMatch[] = [];
      const unavailable: { interpreter: Interpreter; reason: string }[] = [];

      for (const interpreter of interpreters || []) {
        const reasons: string[] = [];
        let score = 0;

        // Find the language match (guaranteed to exist due to server-side filter)
        const langMatch = (interpreter as any).interpreter_languages?.find(
          (il: any) => il.language_id === languageId
        );

        // Server-side filter guarantees langMatch exists with Certified or Registered
        if (!langMatch) {
          continue;
        }

        const certification = langMatch.certification as 'Certified' | 'Registered';
        reasons.push(`${certification} in language`);

        // Step 2: Filter by Modality
        const requiredModality = job.modality;
        const modalityPreferences = interpreter.modality_preferences || [];

        if (requiredModality === 'In-Person') {
          // In-Person jobs require local interpreters
          if (!interpreter.is_local) {
            unavailable.push({
              interpreter,
              reason: 'Not local (required for In-Person)',
            });
            continue;
          }
          reasons.push('Local interpreter');
        }

        // Check if interpreter supports the required modality
        if (requiredModality && !modalityPreferences.includes(requiredModality)) {
          unavailable.push({
            interpreter,
            reason: `Does not support ${requiredModality} modality`,
          });
          continue;
        }

        reasons.push(`Supports ${requiredModality}`);

        // Check unavailability
        if (job.start_time && job.end_time) {
          const { data: unavailabilityBlocks } = await supabase
            .from('interpreter_unavailability')
            .select('*')
            .eq('interpreter_id', interpreter.id);

          if (unavailabilityBlocks && unavailabilityBlocks.length > 0) {
            const jobStart = new Date(job.start_time);
            const jobEnd = new Date(job.end_time);

            const hasConflict = unavailabilityBlocks.some((block) => {
              const blockStart = new Date(block.start_time);
              const blockEnd = new Date(block.end_time);
              // Check for overlap
              return jobStart < blockEnd && jobEnd > blockStart;
            });

            if (hasConflict) {
              unavailable.push({
                interpreter,
                reason: 'Unavailable during job time',
              });
              continue;
            }
          }
        }

        // Step 3: Prioritize by Certification
        if (certification === 'Certified') {
          score = 100;
          reasons.push('Certified (highest priority)');
        } else if (certification === 'Registered') {
          score = 50;
          reasons.push('Registered');
        } else {
          score = 10;
        }

        // Bonus points for proficiency rank if available
        if (langMatch.proficiency_rank) {
          score += (5 - langMatch.proficiency_rank) * 5; // Higher rank = more points
        }

        matches.push({
          ...interpreter,
          matchScore: score,
          matchReason: reasons,
          certification: certification as 'Certified' | 'Registered' | 'Neither',
          preferenceRank: langMatch.preference_rank || null,
        });
      }

      // Sort by preference_rank first (lower is better, 1 = highest preference), then by match score
      // NULL preference_rank values go to the end
      matches.sort((a, b) => {
        // Handle NULL preference ranks (send to end)
        if (a.preferenceRank === null && b.preferenceRank === null) {
          return b.matchScore - a.matchScore; // Both null, sort by score
        }
        if (a.preferenceRank === null) return 1; // a goes after b
        if (b.preferenceRank === null) return -1; // b goes after a

        // Both have preference ranks, sort by preference (lower number = higher priority)
        if (a.preferenceRank !== b.preferenceRank) {
          return a.preferenceRank - b.preferenceRank;
        }

        // Same preference rank, use match score as tiebreaker
        return b.matchScore - a.matchScore;
      });

      return { matches, unavailable };
    },
    enabled: !!job && !!job.client_requests && job.client_requests.length > 0,
  });
}
