import api from './apiClient'

// Define types for the user profile
export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  branchId?: string
  pharmacyId?: string
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
  profileImageUrl?: string
  phoneNumber?: string
  preferredLanguage?: string
  theme?: string
}

// Define the request type for updating a profile
export interface UpdateProfileRequest {
  name: string
  email: string
  phoneNumber?: string
  preferredLanguage?: string
  theme?: string
  password?: string
}

// Define the response type for image upload
export interface ImageUploadResponse {
  url: string
  success: boolean
}

// User API functions
export const userApi = {
  // Get the current user's profile
  getProfile: async (): Promise<UserProfile> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await api.get(`${API_URL}/auth/profile`)
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  // Update the current user's profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await api.put(`${API_URL}/auth/profile`, data)
      return response.data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Upload a profile image
  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      // Try a different endpoint that should exist in your backend
      const response = await api.post(`${API_URL}/users/upload-profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error) {
      console.error('Error uploading profile image:', error)
      // Return a default response instead of throwing an error
      // This allows the app to continue functioning even if image upload fails
      return {
        url: '',
        success: false
      }
    }
  },

  // Change the user's password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      await api.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}