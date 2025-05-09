import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Check if this base URL is correct
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:3001') + '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosClient.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and refresh token
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`API Error: ${error.response?.status || 'Unknown'} for ${error.config?.url}`);
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          // No refresh token, logout user
          await useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

        if (response.status === 200) {
          const { access_token, refresh_token } = response.data;

          // Update tokens in auth store
          useAuthStore.setState({
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });

          // Update Authorization header and retry original request
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return axiosClient(originalRequest);
        } else {
          // Refresh failed, logout user
          await useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
