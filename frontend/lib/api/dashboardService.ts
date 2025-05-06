import api from './apiClient'


export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary')
    return response.data
  },
  
  getRecentSales: async (limit: number = 5) => {
    const response = await api.get(`/dashboard/recent-sales?limit=${limit}`)
    return response.data
  },
  
  getLowStockAlert: async (limit: number = 5) => {
    const response = await api.get(`/dashboard/low-stock?limit=${limit}`)
    return response.data
  },
  
  getExpiringMedicinesAlert: async (days: number = 30, limit: number = 5) => {
    const response = await api.get(`/dashboard/expiring?days=${days}&limit=${limit}`)
    return response.data
  },
  
  getSalesChart: async (period: string = 'week') => {
    const response = await api.get(`/dashboard/sales-chart?period=${period}`)
    return response.data
  },
  
  getTopSellingProducts: async (limit: number = 5) => {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`)
    return response.data
  },
  
  getRevenueStats: async (period: string = 'month') => {
    const response = await api.get(`/dashboard/revenue?period=${period}`)
    return response.data
  },
  
  getPendingPrescriptions: async (limit: number = 5) => {
    const response = await api.get(`/dashboard/pending-prescriptions?limit=${limit}`)
    return response.data
  },
  
  getNotifications: async (limit: number = 10) => {
    const response = await api.get(`/dashboard/notifications?limit=${limit}`)
    return response.data
  },
  
  markNotificationAsRead: async (id: string) => {
    const response = await api.patch(`/dashboard/notifications/${id}/read`)
    return response.data
  },
  
  markAllNotificationsAsRead: async () => {
    const response = await api.patch('/dashboard/notifications/read-all')
    return response.data
  },
}

export default dashboardService