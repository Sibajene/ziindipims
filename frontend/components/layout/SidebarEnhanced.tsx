import React, { useState } from 'react'
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Shield,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard
} from 'lucide-react'
import { useAuthStore } from '../../lib/stores/authStore'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface SidebarEnhancedProps {
  className?: string
  onLogout: () => void
}

export function SidebarEnhanced({ className, onLogout }: SidebarEnhancedProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  
  // More robust role checking with fallbacks
  const userRole = user?.role?.toUpperCase() || ''
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'
  const isManager = userRole === 'MANAGER'
  const isPharmacist = userRole === 'PHARMACIST'

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true,
    },
    {
      name: 'Pharmacy',
      href: '/dashboard/pharmacy',
      icon: Package,
      show: isAdmin || isManager || isPharmacist,
    },
    {
      name: 'Branches',
      href: '/branches',
      icon: Package,
      show: isAdmin || isManager || isPharmacist,
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: Package,
      show: isAdmin || isManager || isPharmacist,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      show: true,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Package,
      show: true,
    },
    {
      name: 'Sales',
      href: '/sales',
      icon: ShoppingCart,
      show: true,
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
      show: isPharmacist || isAdmin || isManager,
    },
    {
      name: 'Prescriptions',
      href: '/prescriptions',
      icon: FileText,
      show: isPharmacist || isAdmin || isManager,
    },
    {
      name: 'Insurance',
      href: '/insurance',
      icon: Shield,
      show: isPharmacist || isAdmin || isManager,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart,
      show: isAdmin || isManager,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      show: isAdmin,
    },
    {
      name: 'Subscriptions',
      href: '/subscriptions',
      icon: CreditCard,
      show: isAdmin,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: isAdmin || isManager,
    },
  ]

  return (
    <div className={cn("flex flex-col h-screen bg-slate-800 text-white", 
                     collapsed ? "w-16" : "w-64", 
                     className)}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && <h1 className="text-xl font-bold">ZiindiPro</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-slate-700 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.filter(item => item.show).map((item) => (
            <li key={item.href}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center p-2 rounded-md transition-all duration-200',
                        pathname === item.href
                          ? 'bg-purple text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      )}
                      aria-label={item.name}
                    >
                      <item.icon size={20} className="shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md transition-all duration-200',
                    pathname === item.href
                      ? 'bg-purple text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-full p-2 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Logout"
              >
                <LogOut size={20} className="shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              Logout
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="flex items-center w-full px-3 py-2 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="ml-3">Logout</span>
          </button>
        )}
      </div>
    </div>
  )
}