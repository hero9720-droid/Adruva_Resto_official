import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useOutletProfile() {
  return useQuery({
    queryKey: ['outlet_profile'],
    queryFn: async () => {
      const { data } = await api.get('/settings/profile');
      return data.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.patch('/settings/profile', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlet_profile'] });
    },
  });
}

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data } = await api.get('/settings/tables');
      return data.data;
    },
  });
}

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data } = await api.get('/settings/zones');
      return data.data;
    },
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/settings/tables', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { data } = await api.patch(`/settings/tables/${id}`, values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}
