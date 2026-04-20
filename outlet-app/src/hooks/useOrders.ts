import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useOrders(params?: any) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await api.get('/orders', { params });
      return data.data;
    },
  });
}

export function useActiveOrderForTable(tableId: string | null) {
  return useQuery({
    queryKey: ['orders', 'active', tableId],
    queryFn: async () => {
      // Fetch orders for this table that are NOT cancelled or served
      const { data } = await api.get('/orders', { 
        params: { 
          table_id: tableId,
        } 
      });
      // Filter for active ones (confirmed, preparing, ready)
      return data.data.find((o: any) => 
        ['confirmed', 'preparing', 'ready'].includes(o.status)
      );
    },
    enabled: !!tableId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/orders', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
