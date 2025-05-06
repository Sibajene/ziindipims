import axiosClient from './axiosClient';

export const branchService = {
  get: async () => {
    try {
      const response = await axiosClient.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/branches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error;
    }
  },

  create: async (branchData: any) => {
    try {
      const response = await axiosClient.post('/branches', branchData);
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  update: async (id: string, branchData: any) => {
    try {
      const response = await axiosClient.put(`/branches/${id}`, branchData);
      return response.data;
    } catch (error) {
      console.error(`Error updating branch with ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/branches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting branch with ID ${id}:`, error);
      throw error;
    }
  }
};