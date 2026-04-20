import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://adruvaresto-backend-production.up.railway.app/api',
});

export default api;
