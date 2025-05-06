'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { Sidebar } from '../../components/layout/sidebar'
import { Header } from '../../components/layout/header'
import Link from 'next/link'
import { CreditCard } from 'lucide-react' // Changed import to lucide-react

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, token, fetchUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check for token directly from localStorage for debugging
    const localToken = localStorage.getItem('token') || localStorage.getItem('test_token')
    console.log('Token in dashboard layout:', localToken)
    
    if (!localToken) {
      console.log('No token found, redirecting to login')
      router.push('/login')
      return
    }
    
    // If we have a token, consider the user authenticated for now
    setIsLoading(false)
    
    // Optionally fetch user details
    fetchUser().catch(console.error)
  }, [router, fetchUser])
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    )
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

// Add Subscriptions link to sidebar navigation
export function DashboardSidebarLinks() {
  return (
    <Link href="/(dashboard)/subscriptions" className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
      <CreditCard className="h-5 w-5 mr-2" />
      <span>Subscriptions</span>
    </Link>
  )
}
