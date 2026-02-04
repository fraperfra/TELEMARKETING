import axios from 'axios';

// Base API client configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Typed API methods
export const apiClient = {
  get: <T>(url: string, params?: object) => api.get<T>(url, { params }).then((r) => r.data),
  post: <T>(url: string, data?: object) => api.post<T>(url, data).then((r) => r.data),
  put: <T>(url: string, data?: object) => api.put<T>(url, data).then((r) => r.data),
  patch: <T>(url: string, data?: object) => api.patch<T>(url, data).then((r) => r.data),
  delete: <T>(url: string) => api.delete<T>(url).then((r) => r.data),
};
