import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Feedback {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  order_id?: string;
  tags: string[];
}

export function useFeedback() {
  return useQuery<Feedback[]>({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/list');
      return data.data;
    },
  });
}

export function useFeedbackStats() {
  return useQuery({
    queryKey: ['feedback', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/stats');
      return data.data; // { average_rating: number, total_reviews: number }
    },
  });
}
