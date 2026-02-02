import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { CommitmentBlockInsert, ClientRequestInsert } from '@/types/database.types';

interface CreateJobParams {
  // Commitment block (job) data
  location_id: string;
  modality: string;
  start_time: string;
  end_time: string;
  duration: number; // minutes
  status?: string;

  // Client request (language/client) data
  client_requests: Array<{
    language_id: string;
    client_name: string;
    case_number?: string;
    meeting_type: string;
    program_id?: string;
    requestor_email?: string;
    specific_location_details?: string;
    key_contact_name?: string;
    charges?: string;
  }>;
}

/**
 * Hook to create a new job with associated client requests
 * Creates commitment_block and related client_requests in a transaction-like pattern
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateJobParams) => {
      const supabase = createClient();

      // Step 1: Create the commitment block (job)
      const { data: job, error: jobError } = await supabase
        .from('commitment_blocks')
        .insert({
          location_id: params.location_id,
          modality: params.modality,
          start_time: params.start_time,
          end_time: params.end_time,
          // duration is generated from start_time and end_time
          status: params.status || 'Initial',
          interpreter_id: null, // No interpreter assigned initially
        })
        .select()
        .single();

      if (jobError || !job) {
        throw new Error(jobError?.message || 'Failed to create job');
      }

      // Step 2: Create client requests (languages) for this job
      const clientRequestsToInsert = params.client_requests.map(req => ({
        commitment_block_id: job.id,
        language_id: req.language_id,
        client_name: req.client_name,
        case_number: req.case_number || null,
        meeting_type: req.meeting_type,
        program_id: req.program_id || null,
        requestor_email: req.requestor_email || null,
        specific_location_details: req.specific_location_details || null,
        key_contact_name: req.key_contact_name || null,
        charges: req.charges || null,
      }));

      const { data: clientRequests, error: clientError } = await supabase
        .from('client_requests')
        .insert(clientRequestsToInsert)
        .select();

      if (clientError) {
        // Rollback: delete the job if client requests failed
        await supabase.from('commitment_blocks').delete().eq('id', job.id);
        throw new Error(clientError.message);
      }

      return {
        job,
        clientRequests,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
