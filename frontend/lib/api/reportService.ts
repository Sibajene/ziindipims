// Placeholder reportService.ts
// Implement report related API calls here

import axiosClient from './axiosClient';

export async function getReports(params?: any) {
  const response = await axiosClient.get('/reports', { params });
  return response.data;
}

export async function getReportById(id: string) {
  const response = await axiosClient.get(`/reports/${id}`);
  return response.data;
}

export async function createReport(data: any) {
  const response = await axiosClient.post('/reports', data);
  return response.data;
}

export async function updateReport(id: string, data: any) {
  const response = await axiosClient.put(`/reports/${id}`, data);
  return response.data;
}

export async function deleteReport(id: string) {
  const response = await axiosClient.delete(`/reports/${id}`);
  return response.data;
}
