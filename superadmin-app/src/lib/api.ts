import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://adruvaresto-backend-production.up.railway.app/api',
  withCredentials: true,
});

export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('sa_token') : null;
export const setToken = (token: string) => localStorage.setItem('sa_token', token);
export const clearToken = () => localStorage.removeItem('sa_token');

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
