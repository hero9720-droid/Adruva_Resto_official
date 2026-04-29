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

export function useGlobalAuditLogs() {
  return useQuery({
    queryKey: ['global_audit_logs'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/audit-logs');
      return data.data;
    },
    refetchInterval: 10000 // Every 10 seconds
  });
}

export function useRevenueTrends() {
  return useQuery({
    queryKey: ['revenue_trends'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/revenue-trends');
      return data.data;
    }
  });
}

export function usePlatformCRM() {
  return useQuery({
    queryKey: ['platform_crm'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/crm');
      return data.data;
    }
  });
}

export function useStorageMetrics() {
  return useQuery({
    queryKey: ['storage_metrics'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/storage');
      return data.data;
    }
  });
}

export function useGlobalSettings() {
  return useQuery({
    queryKey: ['global_settings'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/settings');
      return data.data;
    }
  });
}

export function useUpdateGlobalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/superadmin/mgmt/settings', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global_settings'] });
    }
  });
}

export function usePlatformPayments() {
  return useQuery({
    queryKey: ['platform_payments'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/payments');
      return data.data;
    }
  });
}

export function useChainDetails(id: string) {
  return useQuery({
    queryKey: ['chain_details', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/superadmin/mgmt/chains/${id}`);
      return data.data;
    },
    enabled: !!id
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { portal: string, id: string }) => {
      const { data } = await api.post('/superadmin/mgmt/users/deactivate', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_crm'] });
    }
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (values: { portal: string, id: string, new_password: string }) => {
      const { data } = await api.post('/superadmin/mgmt/users/reset-password', values);
      return data.data;
    }
  });
}

export function useRevenueByPlan() {
  return useQuery({
    queryKey: ['revenue_by_plan'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/mgmt/revenue/by-plan');
      return data.data;
    }
  });
}

