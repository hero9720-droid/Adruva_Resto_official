import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useBills(params?: any) {
  return useQuery({
    queryKey: ['bills', params],
    queryFn: async () => {
      const { data } = await api.get('/billing/list', { params });
      return data.data;
    },
  });
}

export function useBillDetails(id: string) {
  return useQuery({
    queryKey: ['bill', id],
    queryFn: async () => {
      const { data } = await api.get(`/billing/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/billing/payments', values);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bill', variables.bill_id] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useGenerateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/billing/generate', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
