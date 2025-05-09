import axios from 'axios';
import apiClient from '../api/apiClient';

// Get user notifications with proper error handling
export const getUserNotifications = async (userId: string) => {
  try {
    // Check if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.warn('No authentication token found');
      return [];
    }

    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Check if it's an authentication error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Handle token expiration or invalid token
      console.warn('Authentication failed when fetching notifications');
      
      // Return empty array instead of throwing
      return [];
    }
    
    // For other errors, return empty array
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await apiClient.put(`/notifications/user/${userId}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
