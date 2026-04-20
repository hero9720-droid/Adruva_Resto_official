import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useSalesOverview(period: string = '7days') {
  return useQuery({
    queryKey: ['sales_overview', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sales-overview', { params: { period } });
      return data.data;
    },
  });
}

export function useTopItems() {
  return useQuery({
    queryKey: ['top_items'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-items');
      return data.data;
    },
  });
}

export function useStaffPerformance() {
  return useQuery({
    queryKey: ['staff_performance'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/staff-performance');
      return data.data;
    },
  });
}
