import axios from 'axios';
import toast from 'react-hot-toast';

export const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  if (window.location.port === '5173') {
    return 'http://localhost:5000';
  }
  return window.location.origin;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Handle unauthorized (token expired, etc.)
      toast.error('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default client;
