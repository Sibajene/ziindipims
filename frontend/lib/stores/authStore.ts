import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '../api/authService'

interface User {
  id: string
  name: string
  email: string
  role: string
  pharmacyId?: string
  profileImageUrl?: string
  branchId?: string
  lastLogin?: string
  isActive?: boolean
  // Add other user properties as needed
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  
  // Thunks
  login: (email: string, password: string) => Promise<any>
  register: (userData: any) => Promise<any>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  refreshTokenFunc: () => Promise<boolean>
  validateTokenOnInit: () => boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  
  // Thunks
  login: (email: string, password: string) => Promise<any>
  register: (userData: any) => Promise<any>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  refreshTokenFunc: () => Promise<boolean>
  validateTokenOnInit: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      
      // Actions
      setUser: (user) => set({ user }),
      updateUser: (user) => set({ user }),  // Added updateUser method
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      
      // Thunks
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          // Explicitly set tokens in localStorage to ensure sync
          if (typeof window !== 'undefined') {
            if (response.access_token) {
              localStorage.setItem('token', response.access_token);
            }
            if (response.refresh_token) {
              localStorage.setItem('refreshToken', response.refresh_token);
            }
          }
          set({ 
            token: response.access_token,
            refreshToken: response.refresh_token,
            user: response.user || null,
            isAuthenticated: true,
            isLoading: false
          });
          // Fetch user after login to populate user object fully
          await get().fetchUser();
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false 
          });
          // If you're handling redirection here, update it to go to homepage
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      },
      
      fetchUser: async () => {
        try {
          const userData = await authService.getCurrentUser();
          set({ 
            user: userData,
            isAuthenticated: true
          });
          return userData;
        } catch (error) {
          console.error('Error fetching user:', error);
          // If unauthorized, clear the state
          if (error.response?.status === 401) {
            set({ 
              user: null, 
              token: null, 
              refreshToken: null, 
              isAuthenticated: false 
            });
          }
          throw error;
        }
      },
      
      refreshTokenFunc: async () => {
        const currentRefreshToken = get().refreshToken || 
          (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
        
        if (!currentRefreshToken) return false;
        
        try {
          const response = await authService.refreshToken(currentRefreshToken);
          set({ 
            token: response.access_token,
            refreshToken: response.refresh_token || currentRefreshToken
          });
          return true;
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If refresh fails, log the user out
          if (error.response?.status === 401) {
            await get().logout();
          }
          return false;
        }
      },
      
      validateTokenOnInit: () => {
        // Validate token existence and expiration
        const token = get().token || 
          (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        
        if (!token) {
          console.log('validateTokenOnInit: No token found');
          return false;
        }
        
        try {
          // Decode JWT payload
          const payloadBase64 = token.split('.')[1];
          if (!payloadBase64) {
            console.log('validateTokenOnInit: Invalid token format');
            return false;
          }
          
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          const exp = payload.exp;
          
          if (!exp) {
            console.log('validateTokenOnInit: Token has no expiration');
            return false;
          }
          
          const now = Math.floor(Date.now() / 1000);
          
          // Add buffer time (5 seconds) to prevent edge cases
          if (exp < now - 5) {
            console.log(`validateTokenOnInit: Token expired at ${new Date(exp * 1000).toISOString()}, current time is ${new Date(now * 1000).toISOString()}`);
            return false;
          }
          
          console.log('validateTokenOnInit: Token is valid');
          return true;
        } catch (error) {
          console.error('Error validating token:', error);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('authStore: onRehydrateStorage called');
        // When the store is rehydrated from localStorage, set isHydrated to true
        if (state) {
          console.log('authStore: state found during rehydrate', state);
          state.isHydrated = true;
          
          // Initialize token from localStorage if not in state
          if (!state.token && typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            console.log('authStore: token from localStorage during rehydrate:', token);
            if (token) {
              state.token = token;
              state.isAuthenticated = true;
              
              // Validate token immediately
              try {
                const payloadBase64 = token.split('.')[1];
                const payloadJson = atob(payloadBase64);
                const payload = JSON.parse(payloadJson);
                const exp = payload.exp;
                const now = Math.floor(Date.now() / 1000);
                
                // If token is expired or about to expire, don't set it
                if (exp && exp < now + 30) {
                  console.log('authStore: Token from localStorage is expired or about to expire');
                  state.token = null;
                  state.isAuthenticated = false;
                  localStorage.removeItem('token');
                }
              } catch (error) {
                console.error('Error validating token during rehydrate:', error);
              }
            }
          }
          
          // Initialize refreshToken from localStorage if not in state
          if (!state.refreshToken && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('authStore: refreshToken from localStorage during rehydrate:', refreshToken);
            if (refreshToken) {
              state.refreshToken = refreshToken;
            }
          }
        }
      }
    }
  )
);

// Add this to handle hydration in Next.js
if (typeof window !== 'undefined') {
  // Check if the store is already hydrated
  if (!useAuthStore.getState().isHydrated) {
    console.log('authStore: hydration setTimeout triggered');
    // Set hydration after a small delay to ensure it happens after Zustand's own hydration
    setTimeout(() => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state.user : null;
      console.log('authStore: hydration setTimeout token:', token, 'refreshToken:', refreshToken, 'user:', user);
      useAuthStore.setState({ 
        isHydrated: true,
        token: token || null,
        refreshToken: refreshToken || null,
        user: user || null,
        isAuthenticated: !!token
      });
    }, 100);
  }
}

// Proactive token refresh setup
if (typeof window !== 'undefined') {
  // Check token validity every minute
  const tokenCheckInterval = setInterval(() => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated && store.token) {
      try {
        // Decode token to check expiration
        const payloadBase64 = store.token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        
        // If token expires in less than 5 minutes, refresh it
        if (exp && exp - now < 300) {
          console.log('Token expires soon, refreshing...');
          store.refreshTokenFunc().catch(err => {
            console.error('Failed to refresh token:', err);
          });
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    }
  }, 60000); // Check every minute
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(tokenCheckInterval);
  });
}
