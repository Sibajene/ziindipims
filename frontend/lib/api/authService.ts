import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Define the PharmacyData interface
export interface PharmacyData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  openingHours?: string;
  currencyCode?: string;
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Store both tokens
    if (response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token);
    }
    if (response.data.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // Request password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        password 
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  changePassword: async (passwordData: any) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      // Update token in localStorage
      if (response.data.access_token && typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Complete user profile by adding pharmacy details
   */
  completeProfile: async (data: { pharmacy: PharmacyData }): Promise<any> => {
    const response = await api.post('/auth/complete-profile', data);
    return response.data;
  },

  /**
   * Get all branches
   */
  getBranches: async () => {
    try {
      const response = await api.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  /**
   * Get a branch by ID
   */
  getBranch: async (id: string) => {
    try {
      const response = await api.get(`/branches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all users
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get a user by ID
   */
  getUser: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }
}

export default authService;
