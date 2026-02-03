import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JobVersionHistoryEntry {
  id: string;
  job_id: string;
  version_number: number;
  change_source: 'gcal_sync' | 'manual_edit' | 'api';
  changed_fields: Record<string, { old: any; new: any }>;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

export function useJobVersionHistory(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobVersionHistory', jobId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_version_history')
        .select('*')
        .eq('job_id', jobId)
        .order('version_number', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as JobVersionHistoryEntry[];
    },
    enabled: !!jobId,
  });
}
