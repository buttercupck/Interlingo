import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JobCommunication {
  id: string;
  job_id: string;
  communication_type: 'REQ' | 'CONF' | 'REM';
  recipient_email: string | null;
  subject: string | null;
  body: string | null;
  sent_at: string;
  sent_by: string | null;
  marked_sent: boolean;
}

export function useJobCommunications(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobCommunications', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const supabase = createClient();

      const { data, error} = await supabase
        .from('job_communications')
        .select('*')
        .eq('job_id', jobId)
        .order('sent_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as JobCommunication[];
    },
    enabled: !!jobId,
  });
}

export function useAddJobCommunication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      communicationType,
      recipientEmail,
      subject,
      body,
      sentBy,
    }: {
      jobId: string;
      communicationType: 'REQ' | 'CONF' | 'REM';
      recipientEmail: string;
      subject: string;
      body: string;
      sentBy?: string;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_communications')
        .insert({
          job_id: jobId,
          communication_type: communicationType,
          recipient_email: recipientEmail,
          subject,
          body,
          sent_by: sentBy || 'user',
          marked_sent: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobCommunications', variables.jobId] });
    },
  });
}

export function useMarkCommunicationSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      communicationId,
      jobId,
    }: {
      communicationId: string;
      jobId: string;
    }) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('job_communications')
        .update({ marked_sent: true })
        .eq('id', communicationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobCommunications', variables.jobId] });
    },
  });
}
