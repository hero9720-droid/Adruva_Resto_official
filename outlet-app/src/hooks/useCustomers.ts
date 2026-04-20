import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useCustomerLookup(phone: string) {
  return useQuery({
    queryKey: ['customer', phone],
    queryFn: async () => {
      if (!phone || phone.length < 10) return null;
      const { data } = await api.get(`/customers/phone/${phone}`);
      return data.data;
    },
    enabled: phone.length >= 10,
  });
}

export function useCustomerHistory(id: string) {
  return useQuery({
    queryKey: ['customer_history', id],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${id}/history`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useUpsertCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/customers', values);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer', data.phone] });
    },
  });
}
