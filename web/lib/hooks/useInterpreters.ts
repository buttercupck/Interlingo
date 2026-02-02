import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  InterpreterWithLanguages,
  InterpreterInsert,
  InterpreterUpdate,
} from '@/types/database.types';

/**
 * Main hook to fetch all interpreters with their language certifications
 *
 * Performance notes:
 * - Uses 60s stale time for reduced API calls
 * - Refetches on window focus to ensure data freshness
 * - Expected dataset: 50-200 interpreters
 * - Client-side filtering recommended for this size
 *
 * @returns React Query result with interpreters array
 */
export function useInterpreters() {
  return useQuery({
    queryKey: ['interpreters', 'directory'],
    queryFn: async () => {
      const supabase = createClient();

      // Fetch all interpreters with nested language relationships
      // Using LEFT JOIN to include interpreters even if they have no languages
      const { data, error } = await supabase
        .from('interpreters')
        .select(`
          *,
          interpreter_languages (
            id,
            interpreter_id,
            language_id,
            proficiency_rank,
            certification,
            language:languages (
              id,
              name
            )
          )
        `)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch interpreters: ${error.message}`);
      }

      // Type assertion needed due to nested joins
      return (data || []) as unknown as InterpreterWithLanguages[];
    },
    staleTime: 60 * 1000, // 60 seconds - data doesn't change frequently
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Fetch a single interpreter by ID with language details
 *
 * @param interpreterId - UUID of the interpreter
 * @returns React Query result with single interpreter
 */
export function useInterpreter(interpreterId: string | null) {
  return useQuery({
    queryKey: ['interpreter', interpreterId],
    queryFn: async () => {
      if (!interpreterId) {
        throw new Error('Interpreter ID is required');
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from('interpreters')
        .select(`
          *,
          interpreter_languages (
            id,
            interpreter_id,
            language_id,
            proficiency_rank,
            certification,
            language:languages (
              id,
              name
            )
          )
        `)
        .eq('id', interpreterId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch interpreter: ${error.message}`);
      }

      return data as unknown as InterpreterWithLanguages;
    },
    enabled: !!interpreterId, // Only run query if ID is provided
    staleTime: 60 * 1000,
  });
}

/**
 * Create a new interpreter
 *
 * Usage:
 * ```tsx
 * const createInterpreter = useCreateInterpreter();
 *
 * await createInterpreter.mutateAsync({
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john@example.com',
 *   // ... other fields
 * });
 * ```
 *
 * @returns Mutation hook for creating interpreters
 */
export function useCreateInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interpreter: InterpreterInsert) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('interpreters')
        .insert(interpreter)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create interpreter: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch interpreters list
      queryClient.invalidateQueries({ queryKey: ['interpreters', 'directory'] });
    },
    onError: (error: Error) => {
      console.error('Create interpreter error:', error);
      // TODO: Add toast notification here when toast system is implemented
    },
  });
}

/**
 * Update an existing interpreter
 *
 * Usage:
 * ```tsx
 * const updateInterpreter = useUpdateInterpreter();
 *
 * await updateInterpreter.mutateAsync({
 *   id: 'interpreter-uuid',
 *   updates: { phone: '555-1234' }
 * });
 * ```
 *
 * @returns Mutation hook for updating interpreters
 */
export function useUpdateInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: InterpreterUpdate;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('interpreters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update interpreter: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific interpreter and list
      queryClient.invalidateQueries({ queryKey: ['interpreter', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['interpreters', 'directory'] });
    },
    onError: (error: Error) => {
      console.error('Update interpreter error:', error);
      // TODO: Add toast notification here
    },
  });
}

/**
 * Delete an interpreter
 *
 * WARNING: This will cascade delete all related records (language certifications, etc.)
 * Ensure proper confirmation UI before calling this mutation.
 *
 * Usage:
 * ```tsx
 * const deleteInterpreter = useDeleteInterpreter();
 *
 * await deleteInterpreter.mutateAsync('interpreter-uuid');
 * ```
 *
 * @returns Mutation hook for deleting interpreters
 */
export function useDeleteInterpreter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interpreterId: string) => {
      const supabase = createClient();

      const { error } = await supabase
        .from('interpreters')
        .delete()
        .eq('id', interpreterId);

      if (error) {
        throw new Error(`Failed to delete interpreter: ${error.message}`);
      }

      return interpreterId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['interpreter', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['interpreters', 'directory'] });
    },
    onError: (error: Error) => {
      console.error('Delete interpreter error:', error);
      // TODO: Add toast notification here
    },
  });
}
