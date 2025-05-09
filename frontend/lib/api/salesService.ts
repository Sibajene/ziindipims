// Placeholder salesService.ts
// Implement sales related API calls here

import axiosClient from './axiosClient';

export async function getSales(params?: any) {
  const response = await axiosClient.get('/sales', { params });
  return response.data;
}

export async function getSaleById(id: string) {
  const response = await axiosClient.get(`/sales/${id}`);
  return response.data;
}

export async function createSale(data: any) {
  const response = await axiosClient.post('/sales', data);
  return response.data;
}

export async function updateSale(id: string, data: any) {
  const response = await axiosClient.put(`/sales/${id}`, data);
  return response.data;
}

export async function deleteSale(id: string) {
  const response = await axiosClient.delete(`/sales/${id}`);
  return response.data;
}
