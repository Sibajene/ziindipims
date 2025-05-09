import axiosClient from './axiosClient'

import { useAuthStore } from '../stores/authStore'

export const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await axiosClient.get('/users')
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  // Alias for getUsers
  getAllUsers: async () => {
    return await userService.getUsers();
  },

  // Get user by ID
  getUserById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  // Create new user
  createUser: async (userData: any) => {
    try {
      const response = await axiosClient.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Update user
  updateUser: async (id: string, userData: any) => {
    try {
      const response = await axiosClient.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  },

  // Delete user
  deleteUser: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    const { user, token } = useAuthStore.getState()
    if (!user || !token) throw new Error('User not authenticated')
    return await userService.getUserById(user.id)
  },

  // Update current user profile
  updateCurrentUserProfile: async (userData: any) => {
    const { user, token } = useAuthStore.getState()
    if (!user || !token) throw new Error('User not authenticated')
    return await userService.updateUser(user.id, userData)
  }
}
