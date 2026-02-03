import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JobAssignmentAttempt {
  id: string;
  job_id: string;
  interpreter_id: string;
  status: 'contacted' | 'pending' | 'declined' | 'confirmed';
  contacted_at: string;
  responded_at: string | null;
  notes: string | null;
  created_at: string;
  interpreter?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
}

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
          interpreter:interpreters(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('job_id', jobId)
        .order('contacted_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as JobAssignmentAttempt[];
    },
    enabled: !!jobId,
  });
}

export function useAddAssignmentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      interpreterId,
      notes,
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
          status: 'contacted',
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
    },
  });
}

export function useUpdateAssignmentAttemptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      jobId,
      status,
      notes,
    }: {
      attemptId: string;
      jobId: string;
      status: 'contacted' | 'pending' | 'declined' | 'confirmed';
      notes?: string;
    }) => {
      const supabase = createClient();

      const updateData: any = {
        status,
        responded_at: status !== 'contacted' ? new Date().toISOString() : null,
      };

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('job_assignment_attempts')
        .update(updateData)
        .eq('id', attemptId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAssignmentAttempts', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
    },
  });
}
