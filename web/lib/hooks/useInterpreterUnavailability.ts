import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface UnavailabilityBlock {
  id: string;
  interpreter_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
}

export function useInterpreterUnavailability(interpreterId: string | undefined) {
  return useQuery({
    queryKey: ['interpreterUnavailability', interpreterId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('interpreter_unavailability')
        .select('*')
        .eq('interpreter_id', interpreterId)
        .order('start_time', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as UnavailabilityBlock[];
    },
    enabled: !!interpreterId,
  });
}

export function useAddUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (block: Omit<UnavailabilityBlock, 'id' | 'created_at'>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('interpreter_unavailability')
        .insert(block)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['interpreterUnavailability', variables.interpreter_id]
      });
    },
  });
}

export function useUpdateUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: Partial<Omit<UnavailabilityBlock, 'id' | 'created_at' | 'interpreter_id'>>
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('interpreter_unavailability')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['interpreterUnavailability', data.interpreter_id]
      });
    },
  });
}

export function useDeleteUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, interpreterId }: { id: string; interpreterId: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('interpreter_unavailability')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return { id, interpreterId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['interpreterUnavailability', result.interpreterId]
      });
    },
  });
}

// Helper function to check if interpreter is unavailable at a given time
export function isInterpreterUnavailable(
  blocks: UnavailabilityBlock[],
  checkStart: Date,
  checkEnd: Date
): boolean {
  return blocks.some((block) => {
    const blockStart = new Date(block.start_time);
    const blockEnd = new Date(block.end_time);

    // Check if there's any overlap
    return (checkStart < blockEnd && checkEnd > blockStart);
  });
}

// Filter blocks into past and future
export function filterUnavailabilityBlocks(blocks: UnavailabilityBlock[]) {
  const now = new Date();

  const future = blocks.filter((block) => new Date(block.end_time) > now);
  const past = blocks.filter((block) => new Date(block.end_time) <= now);

  return { future, past };
}
