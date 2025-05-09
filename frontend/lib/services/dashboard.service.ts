import { axiosClient } from '../api';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await axiosClient.get('/dashboard/stats');
    return response.data;
  },
};
