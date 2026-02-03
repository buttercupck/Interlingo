import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JobStatusHistoryEntry {
  id: string;
  job_id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

export function useJobStatusHistory(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobStatusHistory', jobId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_status_history')
        .select('*')
        .eq('job_id', jobId)
        .order('changed_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as JobStatusHistoryEntry[];
    },
    enabled: !!jobId,
  });
}
