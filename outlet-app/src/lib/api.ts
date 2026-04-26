import axios from 'axios';

const TOKEN_KEY = 'rms_access_token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://adruvaresto-backend-production.up.railway.app/api',
  withCredentials: true, // for refresh token cookie
});

// ── Request interceptor: attach stored token automatically ────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const token = data.accessToken;
        // Persist refreshed token
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — send to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Helper: save token after login
export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper: clear token on logout
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
  delete api.defaults.headers.common['Authorization'];
}

export default api;
