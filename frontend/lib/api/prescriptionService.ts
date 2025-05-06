import { api } from '../api';

export interface PrescriptionItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
  dosage: string;
  frequency?: string;
  duration?: string;
  quantity: number;
  dispensed?: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  branchId: string;
  patientId: string;
  patient?: {
    id: string;
    name: string;
    dateOfBirth?: string;
    phoneNumber?: string;
  };
  issuedBy: string;
  doctorName?: string;
  hospitalName?: string;
  diagnosis?: string;
  externalId?: string;
  validUntil?: string;
  status: 'PENDING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELED';
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DispenseItemData {
  itemId: string;
  quantityToDispense: number;
  batchId?: string;
  notes?: string;
}

export const prescriptionService = {
  // Get all prescriptions with optional filters
  getPrescriptions: async (filters?: any) => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value as string);
        }
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/prescriptions${queryString}`);
  },
  
  // Get a single prescription by ID
  getPrescription: async (id: string) => {
    return await api.get(`/prescriptions/${id}`);
  },
  
  // Create a new prescription
  createPrescription: async (data: any) => {
    return await api.post('/prescriptions', data);
  },
  
  // Update a prescription
  updatePrescription: async (id: string, data: any) => {
    return await api.put(`/prescriptions/${id}`, data);
  },
  
  // Add an item to a prescription
  addPrescriptionItem: async (prescriptionId: string, itemData: any) => {
    return await api.post(`/prescriptions/${prescriptionId}/items`, itemData);
  },
  
  // Update a prescription item
  updatePrescriptionItem: async (itemId: string, itemData: any) => {
    return await api.put(`/prescriptions/items/${itemId}`, itemData);
  },
  
  // Remove a prescription item
  removePrescriptionItem: async (itemId: string) => {
    return await api.delete(`/prescriptions/items/${itemId}`);
  },
  
  // Cancel a prescription
  cancelPrescription: async (id: string) => {
    return await api.put(`/prescriptions/${id}/cancel`, {});
  },
  
  // Dispense prescription items
  dispensePrescriptionItems: async (prescriptionId: string, items: DispenseItemData[]) => {
    return await api.post(`/prescriptions/${prescriptionId}/dispense`, { items });
  }
};
