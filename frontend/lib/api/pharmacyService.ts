import axiosClient from './axiosClient';
// Removed import api from '../api' as it is not used now
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  license?: string;
  taxId?: string;
  isActive?: boolean;
  logoUrl?: string;
  website?: string;
  openingHours?: string;
  currencyCode?: string;
}

export const pharmacyService = {
  createPharmacy: async (pharmacyData: any) => {
    try {
      const response = await axiosClient.post('/pharmacies', pharmacyData);
      return response.data;
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  },

  assignUserToPharmacy: async (pharmacyId: string, userId: string) => {
    try {
      const response = await axiosClient.post(`/pharmacies/${pharmacyId}/users`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to pharmacy:', error);
      throw error;
    }
  },

  getPharmacyById: async (id: string) => {
    try {
      console.log(`Fetching pharmacy with ID: ${id}`);
      const response = await axiosClient.get(`/pharmacies/${id}`);
      console.log('Pharmacy API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
      throw error;
    }
  },
  
  // Add the missing fallback method that was causing the TypeScript error
  getPharmacyNameFallback: async (id: string) => {
    try {
      console.log(`Fallback: Fetching pharmacy name for ID: ${id}`);
      const response = await axiosClient.get(`/pharmacies/name/${id}`);
      console.log('Fallback API response:', response.data);
      return response.data.name;
    } catch (error) {
      console.error('Error in fallback pharmacy name fetch:', error);
      throw error;
    }
  },
  
  // Get pharmacy by user ID
  getPharmacyByUserId: async (userId: string) => {
    try {
      const response = await axiosClient.get(`/pharmacies/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy by user ID:', error);
      throw error;
    }
  },
  
  // Update an existing pharmacy
  updatePharmacy: async (id: string, pharmacyData: any) => {
    try {
      const response = await axiosClient.put(`/pharmacies/${id}`, pharmacyData);
      return response.data;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      throw error;
    }
  }
};
