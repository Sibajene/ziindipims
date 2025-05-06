import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: API_URL,
})

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401 errors and refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          useAuthStore.getState().logout()
          return Promise.reject(error)
        }
        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken })
        const newToken = response.data.access_token
        if (newToken) {
          // Update token in auth store
          useAuthStore.setState({ token: newToken })
          // Update Authorization header and retry original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
