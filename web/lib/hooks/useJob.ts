import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { JobWithDetails, CommitmentBlockUpdate, ClientRequestUpdate, ClientRequestInsert } from '@/types/database.types';

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const supabase = createClient();

      const { data, error } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          client_requests(*,
            language:languages(*),
            program:court_programs(*)
          ),
          interpreter:interpreters(*,
            interpreter_languages(language_id)
          ),
          location:locations(*,
            organization:organizations(*)
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as unknown as JobWithDetails;
    },
    enabled: !!jobId,
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: CommitmentBlockUpdate }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('commitment_blocks')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useAssignInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, interpreterId }: { jobId: string; interpreterId: string }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('commitment_blocks')
        .update({
          interpreter_id: interpreterId,
          status: 'Pending' // Status updates to Pending when interpreter assigned
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['interpreterMatches', variables.jobId] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const supabase = createClient();

      const { error } = await supabase
        .from('commitment_blocks')
        .delete()
        .eq('id', jobId);

      if (error) {
        throw new Error(error.message);
      }

      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      newStatus,
      oldStatus
    }: {
      jobId: string;
      newStatus: string;
      oldStatus?: string;
    }) => {
      const supabase = createClient();

      // Update the job status
      const { data, error } = await supabase
        .from('commitment_blocks')
        .update({ status: newStatus })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log the status change to audit history
      const { error: historyError } = await supabase
        .from('job_status_history')
        .insert({
          job_id: jobId,
          old_status: oldStatus || null,
          new_status: newStatus,
          changed_by: 'user', // TODO: Replace with actual user ID when auth is implemented
        });

      if (historyError) {
        console.error('Failed to log status change:', historyError);
        // Don't throw here - the status update succeeded, logging is secondary
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useReassignInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, interpreterId }: { jobId: string; interpreterId: string }) => {
      const supabase = createClient();

      // Update interpreter without changing status (keep current status)
      const { data, error } = await supabase
        .from('commitment_blocks')
        .update({
          interpreter_id: interpreterId,
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['interpreterMatches', variables.jobId] });
    },
  });
}

export function useUnassignInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const supabase = createClient();

      // Remove interpreter assignment
      const { data, error } = await supabase
        .from('commitment_blocks')
        .update({
          interpreter_id: null,
          status: 'Initial', // Reset status to Initial when unassigning
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['interpreterMatches', jobId] });
    },
  });
}

/**
 * Hook to update an existing client request
 */
export function useUpdateClientRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientRequestId, updates, jobId }: {
      clientRequestId: string;
      updates: ClientRequestUpdate;
      jobId: string;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('client_requests')
        .update(updates)
        .eq('id', clientRequestId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Hook to add a new client request (language) to an existing job
 * Automatically updates duration from 2hr to 3hr if adding second language
 */
export function useAddClientRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      clientRequest,
      updateDuration = false
    }: {
      jobId: string;
      clientRequest: ClientRequestInsert;
      updateDuration?: boolean;
    }) => {
      const supabase = createClient();

      // Insert the new client request
      const { data: newRequest, error: insertError } = await supabase
        .from('client_requests')
        .insert({
          ...clientRequest,
          commitment_block_id: jobId,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // If updateDuration is true, update the commitment block duration
      if (updateDuration) {
        const { error: updateError } = await supabase
          .from('commitment_blocks')
          .update({ duration: 180 }) // 3 hours in minutes
          .eq('id', jobId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      return newRequest;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
