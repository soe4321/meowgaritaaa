import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_od_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear and redirect if not on public/login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && !currentPath.includes('/login')) {
        localStorage.removeItem('campus_od_token');
        localStorage.removeItem('campus_od_user');
        window.location.href = '/login/student';
      }
    }
    return Promise.reject(error);
  },
);
