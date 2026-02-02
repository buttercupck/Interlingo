import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  JobAssignmentAttemptWithInterpreter,
  JobAssignmentAttemptInsert,
  AssignmentStatus
} from '@/types/database.types';

/**
 * Fetch all assignment attempts for a job, with interpreter details
 */
export function useJobAssignmentAttempts(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobAssignmentAttempts', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_assignment_attempts')
        .select(`
          *,
          interpreter:interpreters(*)
        `)
        .eq('job_id', jobId)
        .order('contacted_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as unknown as JobAssignmentAttemptWithInterpreter[];
    },
    enabled: !!jobId,
  });
}

/**
 * Mark an interpreter as contacted for a job
 * Creates a new attempt record with status='contacted'
 */
export function useMarkContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      interpreterId,
      notes
    }: {
      jobId: string;
      interpreterId: string;
      notes?: string;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_assignment_attempts')
        .insert({
          job_id: jobId,
          interpreter_id: interpreterId,
          status: 'contacted' as AssignmentStatus,
          notes: notes || null,
        })
        .select(`
          *,
          interpreter:interpreters(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as unknown as JobAssignmentAttemptWithInterpreter;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
    },
  });
}

/**
 * Mark an interpreter as declined
 * Updates existing attempt to status='declined' and sets responded_at
 */
export function useMarkDeclined() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      interpreterId,
      notes
    }: {
      jobId: string;
      interpreterId: string;
      notes?: string;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_assignment_attempts')
        .update({
          status: 'declined' as AssignmentStatus,
          responded_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('job_id', jobId)
        .eq('interpreter_id', interpreterId)
        .select(`
          *,
          interpreter:interpreters(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as unknown as JobAssignmentAttemptWithInterpreter;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
    },
  });
}

/**
 * Mark an interpreter as confirmed
 * Updates attempt to status='confirmed', sets responded_at,
 * AND assigns the interpreter to the job
 */
export function useMarkConfirmed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      interpreterId,
      notes
    }: {
      jobId: string;
      interpreterId: string;
      notes?: string;
    }) => {
      const supabase = createClient();

      // Update the attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from('job_assignment_attempts')
        .update({
          status: 'confirmed' as AssignmentStatus,
          responded_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('job_id', jobId)
        .eq('interpreter_id', interpreterId)
        .select(`
          *,
          interpreter:interpreters(*)
        `)
        .single();

      if (attemptError) {
        throw new Error(attemptError.message);
      }

      // Also assign the interpreter to the job and update status
      const { error: assignError } = await supabase
        .from('commitment_blocks')
        .update({
          interpreter_id: interpreterId,
          status: 'Confirmed',
        })
        .eq('id', jobId);

      if (assignError) {
        throw new Error(assignError.message);
      }

      return attempt as unknown as JobAssignmentAttemptWithInterpreter;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Remove an assignment attempt (undo contacted)
 */
export function useRemoveAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      interpreterId
    }: {
      jobId: string;
      interpreterId: string;
    }) => {
      const supabase = createClient();

      const { error } = await supabase
        .from('job_assignment_attempts')
        .delete()
        .eq('job_id', jobId)
        .eq('interpreter_id', interpreterId);

      if (error) {
        throw new Error(error.message);
      }

      return { jobId, interpreterId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
    },
  });
}

/**
 * Helper hook to get attempts grouped by status
 */
export function useGroupedAttempts(jobId: string | undefined) {
  const { data: attempts, ...rest } = useJobAssignmentAttempts(jobId);

  const grouped = {
    pending: (attempts || []).filter(a => a.status === 'contacted' || a.status === 'pending'),
    declined: (attempts || []).filter(a => a.status === 'declined'),
    confirmed: (attempts || []).filter(a => a.status === 'confirmed'),
  };

  const attemptedInterpreterIds = new Set((attempts || []).map(a => a.interpreter_id));

  return {
    ...rest,
    attempts,
    grouped,
    attemptedInterpreterIds,
  };
}
