import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useReservations(date: string) {
  return useQuery({
    queryKey: ['reservations', date],
    queryFn: async () => {
      const { data } = await api.get('/reservations', { params: { date } });
      return data.data;
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.post('/reservations', values);
      return data.data;
    },
    onSuccess: (_, variables) => {
      const date = variables.reservation_time.split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['reservations', date] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/reservations/${id}/status`, { status });
      return data.data;
    },
    onSuccess: (data) => {
      const date = data.reservation_time.split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['reservations', date] });
      queryClient.invalidateQueries({ queryKey: ['tables'] }); // Table status might change
    },
  });
}
