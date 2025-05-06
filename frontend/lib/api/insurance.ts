import api from './apiClient'


export interface InsuranceProvider {
  id: string
  name: string
  code: string
  contact?: string | null
  email?: string | null
  address?: string | null
  active: boolean
  approvalRequired: boolean
  paymentTermDays: number
  discountRate?: number | null
  createdAt: string
  updatedAt: string
}

export interface InsurancePlan {
  id: string
  name: string
  code: string
  providerId: string
  provider?: InsuranceProvider
  coveragePercentage: number
  annualLimit?: number | null
  requiresApproval: boolean
  patientCopay: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface PlanCoverageItem {
  id: string
  planId: string
  itemType: string
  itemId?: string | null
  coveragePercentage: number
  maxAmount?: number | null
  requiresApproval: boolean
  createdAt: string
  updatedAt: string
}

export interface InsuranceClaim {
  id: string
  providerId: string
  planId: string
  patientId: string
  saleId?: string | null
  claimNumber: string
  totalAmount: number
  coveredAmount: number
  status: ClaimStatus
  submittedAt: string
  processedAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface CreateProviderRequest {
  name: string
  code: string
  contact?: string
  email?: string
  address?: string
  active?: boolean
  approvalRequired?: boolean
  paymentTermDays?: number
  discountRate?: number
}

export interface UpdateProviderRequest {
  name?: string
  contact?: string
  email?: string
  address?: string
  active?: boolean
  approvalRequired?: boolean
  paymentTermDays?: number
  discountRate?: number
}

export interface CreatePlanRequest {
  name: string
  code: string
  providerId: string
  coveragePercentage: number
  annualLimit?: number | null
  requiresApproval?: boolean
  patientCopay?: number
  active?: boolean
}

export interface UpdatePlanRequest {
  name?: string
  coveragePercentage?: number
  annualLimit?: number | null
  requiresApproval?: boolean
  patientCopay?: number
  active?: boolean
}

export interface AddCoverageItemRequest {
  itemType: string
  itemId?: string
  coveragePercentage: number
  maxAmount?: number
  requiresApproval?: boolean
}

export interface UpdateCoverageItemRequest {
  coveragePercentage?: number
  maxAmount?: number | null
  requiresApproval?: boolean
}

export interface UpdateClaimStatusRequest {
  status: ClaimStatus
  notes?: string
  processedAt?: string
}

export interface UpdateClaimItemsRequest {
  items: {
    id: string
    coveredAmount: number
  }[]
}

export const insuranceApi = {
  // Provider endpoints
  getProviders: async (params?: { 
    skip?: number, 
    take?: number, 
    name?: string, 
    active?: boolean 
  }): Promise<InsuranceProvider[]> => {
    const response = await api.get('/insurance/providers', { params })
    return response.data
  },

  getProviderById: async (id: string): Promise<InsuranceProvider> => {
    const response = await api.get(`/insurance/providers/${id}`)
    return response.data
  },

  createProvider: async (data: CreateProviderRequest): Promise<InsuranceProvider> => {
    const response = await api.post('/insurance/providers', data)
    return response.data
  },

  updateProvider: async (id: string, data: UpdateProviderRequest): Promise<InsuranceProvider> => {
    const response = await api.put(`/insurance/providers/${id}`, data)
    return response.data
  },

  // Plan endpoints
  getPlans: async (params?: { 
    skip?: number, 
    take?: number, 
    providerId?: string, 
    active?: boolean 
  }): Promise<InsurancePlan[]> => {
    const response = await api.get('/insurance/plans', { params })
    return response.data
  },

  getPlanById: async (id: string): Promise<InsurancePlan> => {
    const response = await api.get(`/insurance/plans/${id}`)
    return response.data
  },

  createPlan: async (data: CreatePlanRequest): Promise<InsurancePlan> => {
    const response = await api.post('/insurance/plans', data)
    return response.data
  },

  updatePlan: async (id: string, data: UpdatePlanRequest): Promise<InsurancePlan> => {
    const response = await api.put(`/insurance/plans/${id}`, data)
    return response.data
  },

  // Coverage Item endpoints
  addCoverageItem: async (planId: string, data: AddCoverageItemRequest): Promise<PlanCoverageItem> => {
    const response = await api.post(`/insurance/plans/${planId}/coverage`, data)
    return response.data
  },

  updateCoverageItem: async (id: string, data: UpdateCoverageItemRequest): Promise<PlanCoverageItem> => {
    const response = await api.put(`/insurance/coverage/${id}`, data)
    return response.data
  },

  removeCoverageItem: async (id: string): Promise<PlanCoverageItem> => {
    const response = await api.delete(`/insurance/coverage/${id}`)
    return response.data
  },

  // Claim endpoints
  getClaims: async (params?: { 
    skip?: number, 
    take?: number, 
    providerId?: string, 
    status?: ClaimStatus,
    startDate?: string,
    endDate?: string
  }): Promise<InsuranceClaim[]> => {
    const response = await api.get('/insurance/claims', { params })
    return response.data
  },

  getClaimById: async (id: string): Promise<InsuranceClaim> => {
    const response = await api.get(`/insurance/claims/${id}`)
    return response.data
  },

  updateClaimStatus: async (id: string, data: UpdateClaimStatusRequest): Promise<InsuranceClaim> => {
    const response = await api.put(`/insurance/claims/${id}/status`, data)
    return response.data
  },

  updateClaimItems: async (id: string, data: UpdateClaimItemsRequest): Promise<InsuranceClaim> => {
    const response = await api.put(`/insurance/claims/${id}/items`, data)
    return response.data
  },

  // Statistics
  getClaimStatistics: async (params?: {
    providerId?: string,
    startDate?: string,
    endDate?: string
  }): Promise<any> => {
    const response = await api.get('/insurance/statistics', { params })
    return response.data
  },

  // Eligible sales for insurance claims
  getEligibleSales: async (params?: {
    patientId?: string,
    skip?: number,
    take?: number
  }): Promise<any[]> => {
    const response = await api.get('/insurance/eligible-sales', { params })
    return response.data
  },

  // Create a new insurance claim
  createClaim: async (data: {
    patientId: string,
    providerId: string,
    planId: string,
    saleId: string,
    notes?: string
  }): Promise<any> => {
    const response = await api.post('/insurance/claims', data)
    return response.data
  }
}