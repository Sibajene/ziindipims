import axios from 'axios';
import api from '../api';

// Base URL configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get current subscription with proper error handling
export const getCurrentSubscription = async (pharmacyId: string) => {
  try {
    // Make sure we have a token before making the request
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }

    const response = await api.get(`/subscriptions/current`, {
      params: { pharmacyId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    
    // Check if it's an authentication error
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      // Redirect to login if authentication failed
      if (typeof window !== 'undefined') {
        // Optional: You can redirect to login page
        // window.location.href = '/login';
      }
    }
    
    return null;
  }
};

// Get subscription history with proper error handling
export const getSubscriptionHistory = async (pharmacyId: string) => {
  try {
    // Make sure we have a token before making the request
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found');
      return [];
    }

    const response = await api.get(`/subscriptions/history`, {
      params: { pharmacyId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return [];
  }
};

// Create a new subscription
export const createSubscription = async (data: any) => {
  try {
    const response = await api.post('/subscriptions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Update an existing subscription
export const updateSubscription = async (id: string, data: any) => {
  try {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (id: string) => {
  try {
    const response = await api.post(`/subscriptions/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};