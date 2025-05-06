'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/stores/authStore'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const token = useAuthStore((state) => state.token)
  const refreshTokenFunc = useAuthStore((state) => state.refreshTokenFunc)
  const validateTokenOnInit = useAuthStore((state) => state.validateTokenOnInit)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const [isLoading, setIsLoading] = useState(true)

  // Debug token
  useEffect(() => {
    if (token) {
      console.log('Client layout - token available:', token.substring(0, 20) + '...');
      
      // Decode and log token expiry
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log('Token expires:', expDate.toLocaleString());
          console.log('Current time:', now.toLocaleString());
          console.log('Time until expiry:', Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('Client layout - no token available');
    }
  }, [token]);

  // Fetch user data when the store is hydrated and we have a token
  useEffect(() => {
    if (isHydrated) {
      console.log('Auth store hydrated, checking token...');
      if (token && validateTokenOnInit()) {
        console.log('Token valid, fetching user...');
        fetchUser()
          .then(userData => {
            console.log('User fetched successfully:', userData);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error fetching user in layout:', err);
            setIsLoading(false);
          });
      } else {
        console.log('No valid token found');
        setIsLoading(false);
      }
    }
  }, [isHydrated, token, fetchUser, validateTokenOnInit]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isHydrated || !token) return;

    // Decode token to get expiry
    let refreshInterval = 5 * 60 * 1000; // default 5 minutes
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const exp = payload.exp;
      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        const msUntilExpiry = (exp - now) * 1000;
        // Refresh at 80% of token lifetime or at least 1 minute before expiry
        refreshInterval = Math.max(msUntilExpiry * 0.8, msUntilExpiry - 60000);
        console.log(`Setting token refresh in ${Math.floor(refreshInterval/1000/60)} minutes`);
      }
    } catch (error) {
      console.error('Error decoding token for refresh interval:', error);
    }

    const interval = setInterval(async () => {
      console.log('Attempting token refresh...');
      try {
        const success = await refreshTokenFunc();
        console.log('Token refresh result:', success ? 'success' : 'failed');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshTokenFunc, isHydrated, token]);

  if (isLoading && !isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return children;
}