import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useStaffList() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/staff/list');
      return data.data;
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
    },
  });

  const clockOut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/staff/clock-out');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
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
    },
  });

  const endShift = useMutation({
    mutationFn: async (values?: any) => {
      const { data } = await api.post('/staff/shifts/end', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  return { startShift, endShift };
}
