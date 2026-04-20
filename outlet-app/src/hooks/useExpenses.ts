import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await api.get('/expenses');
      return data.data;
    },
  });
}

export function useTaxReport(params: any) {
  return useQuery({
    queryKey: ['tax_report', params],
    queryFn: async () => {
      const { data } = await api.get('/expenses/tax-report', { params });
      return data.data;
    },
    enabled: !!params.start_date,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/expenses', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
