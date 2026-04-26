import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

function getOutletId() {
  return typeof window !== 'undefined' ? localStorage.getItem('last_outlet_id') : null;
}

export function useComplianceHistory() {
  return useQuery({
    queryKey: ['compliance-history'],
    queryFn: async () => {
      const outletId = getOutletId();
      if (!outletId) return [];
      const { data } = await api.get(`/compliance/${outletId}/history`);
      return data.data;
    },
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      const outletId = getOutletId();
      if (!outletId) return null;
      const { data } = await api.get(`/compliance/${outletId}/stats`);
      return data.data;
    },
  });
}

export function useSubmitAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const outletId = getOutletId();
      const { data } = await api.post(`/compliance/${outletId}/audits`, values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-history'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    },
  });
}
