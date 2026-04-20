import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGlobalMetrics() {
  return useQuery({
    queryKey: ['global_metrics'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/metrics');
      return data.data;
    }
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system_health'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/health');
      return data.data;
    },
    refetchInterval: 30000
  });
}

export function useChains() {
  return useQuery({
    queryKey: ['all_chains'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/chains');
      return data.data;
    }
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/plans');
      return data.data;
    }
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/superadmin/mgmt/plans', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    }
  });
}

export function useOnboardChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/superadmin/mgmt/chains/onboard', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_chains'] });
      queryClient.invalidateQueries({ queryKey: ['global_metrics'] });
    }
  });
}

export function useSuspendChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/superadmin/mgmt/chains/${id}/suspend`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_chains'] });
    }
  });
}
