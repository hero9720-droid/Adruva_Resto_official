import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useStaffList(mode?: string) {
  return useQuery({
    queryKey: ['staff', mode],
    queryFn: async () => {
      const { data } = await api.get('/staff/list', { params: mode ? { mode } : undefined });
      return data.data;
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      role: string;
      pin?: string;
      base_pay_paise: number;
    }) => {
      const { data } = await api.post('/staff/create', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useAttendance(params?: any) {
  const queryClient = useQueryClient();

  const clockIn = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/staff/clock-in');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'current-status'] });
    },
  });

  const clockOut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/staff/clock-out');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'current-status'] });
    },
  });

  return { clockIn, clockOut };
}

export function useAttendanceList(date?: string) {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      const { data } = await api.get('/staff/attendance', { params: { date } });
      return data.data;
    },
  });
}

export function useShift() {
  const queryClient = useQueryClient();

  const startShift = useMutation({
    mutationFn: async (values?: any) => {
      const { data } = await api.post('/staff/shifts/start', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'current-status'] });
    },
  });

  const endShift = useMutation({
    mutationFn: async (values?: any) => {
      const { data } = await api.post('/staff/shifts/end', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'current-status'] });
    },
  });

  return { startShift, endShift };
}
export function useCurrentStatus() {
  return useQuery({
    queryKey: ['staff', 'current-status'],
    queryFn: async () => {
      const { data } = await api.get('/staff/current-status');
      return data.data; // { isClockedIn: boolean, isShiftActive: boolean }
    },
    refetchInterval: 30000, // every 30s
  });
}
