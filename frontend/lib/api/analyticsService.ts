import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const analyticsService = {
  getAnalyticsSummary: async (pharmacyId: string) => {
    const response = await axios.get(`${API_URL}/analytics/summary`, {
      params: { pharmacyId },
    });
    return response.data;
  },
};
