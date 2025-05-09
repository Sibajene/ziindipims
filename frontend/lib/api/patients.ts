import axios from 'axios'

// Configure axios to include auth token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      
      // Also set a cookie for server-side API routes
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Define the Patient interface
export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  emergencyContact?: string
  allergies?: string
  medicalConditions?: string
  status?: 'active' | 'inactive'
  lastVisit?: string
  insuranceProvider?: string
  insuranceNumber?: string
  createdAt: string
  updatedAt: string
}

export interface PatientInsurance {
  id: string
  patientId: string
  providerId: string
  policyNumber: string
  groupNumber?: string
  coverageType: string
  startDate: string
  endDate?: string
  status: string
  createdAt: string
  updatedAt: string
  provider?: {
    id: string
    name: string
  }
}

// API functions for patients
export async function getPatients(params?: {
  skip?: number
  take?: number
  name?: string
  phone?: string
}) {
  const response = await axios.get('/api/patients', { params })
  return response.data
}

export async function getPatient(id: string) {
  const response = await axios.get(`/api/patients/${id}`)
  return response.data
}

export async function createPatient(data: {
  name: string
  phone: string
  email?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  emergencyContact?: string
  allergies?: string
  medicalConditions?: string
}) {
  const response = await axios.post('/api/patients', data)
  return response.data
}

// Minimal test case for patient creation with only required fields
export async function createMinimalPatientTest() {
  const minimalData = {
    name: "Test Patient",
    gender: "OTHER"
  }
  try {
    console.log('Sending minimal patient data to API:', minimalData)
    const response = await axios.post('/api/patients', minimalData)
    console.log('Minimal patient creation response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating minimal patient:', error)
    throw error
  }
}

export async function updatePatient(id: string, data: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  allergies?: string
  medicalConditions?: string
  notes?: string
}) {
  // Format the data to match what the backend expects
  const formattedData = {
    name: `${data.firstName} ${data.lastName}`, // Backend might expect a single name field
    phone: data.phone,
    email: data.email || null,
    dob: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    gender: data.gender,
    address: data.address || null,
  }

  const response = await axios.put(`/api/patients/${id}`, formattedData)
  return response.data
}

export async function getPatientMedicationHistory(id: string) {
  try {
    const response = await axios.get(`/api/patients/${id}/medication-history`)
    return response.data
  } catch (error) {
    console.error('Error fetching medication history:', error)
    return {
      patientId: id,
      patientName: '',
      medicationHistory: []
    }
  }
}

export async function getPatientInsurance(id: string) {
  try {
    const response = await axios.get(`/api/patients/${id}/insurance`)
    return response.data
  } catch (error) {
    console.error('Error fetching patient insurance:', error)
    // Return empty array instead of throwing
    return []
  }
}

export async function addPatientInsurance(patientId: string, data: {
  providerId: string
  policyNumber: string
  groupNumber?: string
  coverageType: string
  startDate: string
  endDate?: string
  status: string
}) {
  try {
    const response = await axios.post(`/api/patients/${patientId}/insurance`, data)
    return response.data
  } catch (error) {
    console.error('Error adding insurance plan:', error)
    throw error
  }
}

export async function updatePatientInsurance(insuranceId: string, data: {
  providerId?: string
  policyNumber?: string
  groupNumber?: string
  coverageType?: string
  startDate?: string
  endDate?: string
  status?: string
}) {
  try {
    const response = await axios.put(`/api/patients/insurance/${insuranceId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating insurance plan:', error)
    throw error
  }
}

export async function removePatientInsurance(insuranceId: string) {
  try {
    const response = await axios.delete(`/api/patients/insurance/${insuranceId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting insurance plan:', error)
    throw error
  }
}
