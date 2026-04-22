import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  parent_id: string | null;
  item_count: number;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  photo_url: string | null;
  base_price_paise: number;
  cost_price_paise: number;
  food_type: 'veg' | 'non_veg' | 'egg' | 'vegan';
  is_available: boolean;
  is_featured: boolean;
  preparation_time_minutes: number;
  sort_order: number;
}

export interface MenuStats {
  item_count: number;
  category_count: number;
  max_menu_items: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useMenuStats() {
  return useQuery<MenuStats>({
    queryKey: ['menuStats'],
    queryFn: async () => {
      const { data } = await api.get('/menu/stats');
      return data.data;
    },
    staleTime: 30_000,
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/menu/categories');
      return data.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; icon?: string; sort_order?: number }) => {
      const { data } = await api.post('/menu/categories', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menuStats'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; icon?: string; sort_order?: number }) => {
      const { data } = await api.patch(`/menu/categories/${id}`, values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuStats'] });
    },
  });
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export function useMenuItems(category_id?: string, search?: string) {
  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', category_id, search],
    queryFn: async () => {
      const { data } = await api.get('/menu/items', {
        params: { category_id, search },
      });
      return data.data;
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<MenuItem>) => {
      const { data } = await api.post('/menu/items', values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuStats'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Partial<MenuItem>) => {
      const { data } = await api.patch(`/menu/items/${id}`, values);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuStats'] });
    },
  });
}

// ─── Modifiers & Variants ──────────────────────────────────────────────────────

export function useAddVariants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { menu_item_id: string; variants: any[] }) => {
      const res = await api.post('/menu/items/variants', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useAddModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/menu/items/modifier-groups', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

export function useUploadMenuPhoto() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      // Upload via backend proxy — avoids R2 CORS issues entirely
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/menu/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.data.url;
    },
  });
}

