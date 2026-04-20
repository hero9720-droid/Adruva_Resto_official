import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useChainMetrics() {
  return useQuery({
    queryKey: ['chain_metrics'],
    queryFn: async () => {
      const { data } = await api.get('/chain/mgmt/metrics');
      return data.data;
    }
  });
}

export function useOutlets() {
  return useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const { data } = await api.get('/chain/mgmt/outlets');
      return data.data;
    }
  });
}

export function useMasterMenu() {
  return useQuery({
    queryKey: ['master_menu'],
    queryFn: async () => {
      const { data: categories } = await api.get('/chain/mgmt/master-menu/categories');
      const { data: items } = await api.get('/chain/mgmt/master-menu/items');
      return { categories: categories.data, items: items.data };
    }
  });
}

export function useSyncMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target_outlet_ids: string[]) => {
      const { data } = await api.post('/chain/mgmt/sync-menu', { target_outlet_ids });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
    }
  });
}

export function useCreateMasterItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/chain/mgmt/master-menu/items', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master_menu'] });
    }
  });
}
