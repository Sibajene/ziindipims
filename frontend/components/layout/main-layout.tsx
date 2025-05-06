import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from './../../lib/stores/authStore'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, fetchUser, isHydrated } = useAuthStore()
  
  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        fetchUser()
      }
    }
  }, [isHydrated, isAuthenticated, router, fetchUser])
  
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
