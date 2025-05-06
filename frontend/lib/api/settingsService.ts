import api from './apiClient'


export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings')
    return response.data
  },
  
  updateSettings: async (settingsData: any) => {
    const response = await api.patch('/settings', settingsData)
    return response.data
  },
  
  getPharmacyProfile: async () => {
    const response = await api.get('/settings/pharmacy')
    return response.data
  },
  
  updatePharmacyProfile: async (profileData: any) => {
    const response = await api.patch('/settings/pharmacy', profileData)
    return response.data
  },
  
  getBranches: async () => {
    const response = await api.get('/settings/branches')
    return response.data
  },
  
  createBranch: async (branchData: any) => {
    const response = await api.post('/settings/branches', branchData)
    return response.data
  },
  
  updateBranch: async (id: string, branchData: any) => {
    const response = await api.patch(`/settings/branches/${id}`, branchData)
    return response.data
  },
  
  deleteBranch: async (id: string) => {
    const response = await api.delete(`/settings/branches/${id}`)
    return response.data
  },
  
  getNotificationSettings: async () => {
    const response = await api.get('/settings/notifications')
    return response.data
  },
  
  updateNotificationSettings: async (notificationData: any) => {
    const response = await api.patch('/settings/notifications', notificationData)
    return response.data
  },
  
  getSystemLogs: async (params?: any) => {
    const response = await api.get('/settings/logs', { params })
    return response.data
  },
  
  backupData: async () => {
    const response = await api.post('/settings/backup', {})
    return response.data
  },
  
  restoreData: async (backupFile: File) => {
    const formData = new FormData()
    formData.append('backup', backupFile)
    
    const response = await api.post('/settings/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export default settingsService