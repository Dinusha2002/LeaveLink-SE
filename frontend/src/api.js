import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  console.log('🔧 API Interceptor - Token:', token ? 'Token exists' : 'No token');
  console.log('🔧 API Interceptor - Request URL:', cfg.url);
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
    console.log('🔧 API Interceptor - Added Authorization header');
  } else {
    console.warn('⚠️ API Interceptor - No token found for request:', cfg.url);
  }
  return cfg;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
