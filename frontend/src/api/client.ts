import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to inject X-Tenant-ID, Authorization header, and Correlation ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const activeTenantId = localStorage.getItem('active_tenant_id') || 'default';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Tenant-ID'] = activeTenantId;
  config.headers['X-Correlation-ID'] = 'fe-' + Math.random().toString(36).substring(2, 10);

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401/403 errors smoothly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - session may have expired.');
    }
    return Promise.reject(error);
  }
);

export default api;

