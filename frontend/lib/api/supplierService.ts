import api from './apiClient'


export const supplierService = {
  getSuppliers: async () => {
    const response = await api.get('/suppliers')
    return response.data
  },
  
  getSupplierById: async (id: string) => {
    const response = await api.get(`/suppliers/${id}`)
    return response.data
  },
  
  createSupplier: async (data: any) => {
    const response = await api.post('/suppliers', data)
    return response.data
  },
  
  updateSupplier: async (id: string, data: any) => {
    const response = await api.put(`/suppliers/${id}`, data)
    return response.data
  },
  
  deleteSupplier: async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`)
    return response.data
  },
  
  getSupplierProducts: async (supplierId: string) => {
    const response = await api.get(`/suppliers/${supplierId}/products`)
    return response.data
  },
  
  createPurchaseOrder: async (orderData: any) => {
    const response = await api.post('/suppliers/purchase-orders', orderData)
    return response.data
  },
  
  getPurchaseOrders: async (params?: any) => {
    const response = await api.get('/suppliers/purchase-orders', { params })
    return response.data
  },
  
  getPurchaseOrderById: async (id: string) => {
    const response = await api.get(`/suppliers/purchase-orders/${id}`)
    return response.data
  },
  
  updatePurchaseOrder: async (id: string, orderData: any) => {
    const response = await api.patch(`/suppliers/purchase-orders/${id}`, orderData)
    return response.data
  },
  
  deletePurchaseOrder: async (id: string) => {
    const response = await api.delete(`/suppliers/purchase-orders/${id}`)
    return response.data
  },
  
  receivePurchaseOrder: async (id: string, receivedData: any) => {
    const response = await api.post(`/suppliers/purchase-orders/${id}/receive`, receivedData)
    return response.data
  },
}

export default supplierService