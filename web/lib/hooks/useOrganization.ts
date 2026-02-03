import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface Organization {
  id: string;
  name: string;
  abbreviation: string;
  address?: string | null;
  type?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useOrganization(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw new Error(error.message);
      return data as Organization;
    },
    enabled: !!organizationId,
  });
}
