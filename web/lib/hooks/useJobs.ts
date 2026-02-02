import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { JobWithDetails } from '@/types/database.types';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
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
        .order('start_time', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as unknown as JobWithDetails[];
    },
  });
}

export function useUpcomingJobs(limit = 10) {
  return useQuery({
    queryKey: ['jobs', 'upcoming', limit],
    queryFn: async () => {
      const supabase = createClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
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
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as unknown as JobWithDetails[];
    },
  });
}
