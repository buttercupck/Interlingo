import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Debug hook to inspect raw data structure from Supabase
 */
export function useJobDebug(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobDebug', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const supabase = createClient();

      // Test basic query first
      const { data: basicData, error: basicError } = await supabase
        .from('commitment_blocks')
        .select('*')
        .eq('id', jobId)
        .single();

      console.log('BASIC COMMITMENT BLOCK DATA:', basicData);
      console.log('BASIC ERROR:', basicError);

      // Test with client_requests
      const { data: withRequests, error: requestsError } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          client_requests(*)
        `)
        .eq('id', jobId)
        .single();

      console.log('WITH CLIENT_REQUESTS:', withRequests);
      console.log('CLIENT_REQUESTS ERROR:', requestsError);

      // Test the full query
      const { data: fullData, error: fullError } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          client_requests(*,
            language:languages(*),
            program:court_programs(*)
          ),
          interpreter:interpreters(*),
          location:locations(*,
            organization:organizations(*)
          )
        `)
        .eq('id', jobId)
        .single();

      console.log('FULL QUERY DATA:', JSON.stringify(fullData, null, 2));
      console.log('FULL QUERY ERROR:', fullError);

      return {
        basicData,
        basicError,
        withRequests,
        requestsError,
        fullData,
        fullError
      };
    },
    enabled: !!jobId,
  });
}
