import axiosClient from './axiosClient';

export const notificationsService = {
  getUserNotifications: async (userId: string) => {
    try {
      const response = await axiosClient.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      const response = await axiosClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  markAllAsRead: async (userId: string) => {
    try {
      const response = await axiosClient.put(`/notifications/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};
