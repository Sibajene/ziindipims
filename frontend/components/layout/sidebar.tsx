import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from './../../lib/utils'
import { useAuthStore } from './../../lib/stores/authStore'
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
  CreditCard,
  Truck,
  House,
  Hospital,
  BriefcaseMedicalIcon,
  Archive,
  GitBranch,
  Building2,
  Locate
} from 'lucide-react'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  
  console.log('Current user in sidebar:', user)
  
  // More robust role checking with fallbacks
  const userRole = user?.role?.toUpperCase() || ''
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'
  const isSystemAdmin = userRole === 'ADMIN' // Add this line to specifically identify system admins
  const isManager = userRole === 'MANAGER'
  const isPharmacist = userRole === 'PHARMACIST'
  const userPharmacyId = user?.pharmacyId || null
  
  console.log('User role:', userRole)
  console.log('Role flags:', { isAdmin, isManager, isPharmacist })
  console.log('User pharmacyId:', userPharmacyId)

  // Group navigation items by category
  const navCategories = [
    {
      name: "Main",
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: Home,
          show: true,
        },
      ]
    },
    {
      name: "Pharmacy Management",
      items: [
        {
          name: 'Pharmacy',
          href: '/pharmacy/details',
          icon: Hospital,
          show: isAdmin || isManager,
        },
        {
          name: 'Branches',
          href: '/branches',
          icon: Locate,
          show: isAdmin || isManager || isPharmacist,
        },
        {
          name: 'Suppliers',
          href: '/suppliers',
          icon: Truck,
          show: isSystemAdmin || ((isAdmin || isManager || isPharmacist) && !!userPharmacyId),
        },
      ]
    },
    {
      name: "Inventory & Sales",
      items: [
        {
          name: 'Products',
          href: '/products',
          icon: Package,
          show: isSystemAdmin || !!userPharmacyId,
        },
        {
          name: 'Inventory',
          href: '/inventory',
          icon: Archive,
          show: isSystemAdmin || !!userPharmacyId,
        },
        {
          name: 'Sales',
          href: '/sales',
          icon: ShoppingCart,
          show: isSystemAdmin || !!userPharmacyId,
        },
      ]
    },
    {
      name: "Patient Care",
      items: [
        {
          name: 'Patients',
          href: '/patients',
          icon: Users,
          show: isSystemAdmin || ((isPharmacist || isAdmin || isManager) && !!userPharmacyId),
        },
        {
          name: 'Prescriptions',
          href: '/prescriptions',
          icon: FileText,
          show: isSystemAdmin || ((isPharmacist || isAdmin || isManager) && !!userPharmacyId),
        },
        {
          name: 'Insurance',
          href: '/insurance',
          icon: Shield,
          show: isSystemAdmin || ((isPharmacist || isAdmin || isManager) && !!userPharmacyId),
        },
      ]
    },
    {
      name: "Administration",
      items: [
        {
          name: 'Reports',
          href: '/reports',
          icon: BarChart,
          show: isSystemAdmin || ((isAdmin || isManager) && !!userPharmacyId),
        },
        {
          name: 'Users',
          href: '/users',
          icon: Users,
          show: isSystemAdmin || (isAdmin && !!userPharmacyId),
        },
        {
          name: 'Subscriptions',
          href: '/subscriptions',
          icon: CreditCard,
          show: isSystemAdmin || (isAdmin && !!userPharmacyId),
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: Settings,
          show: isSystemAdmin || ((isAdmin || isManager) && !!userPharmacyId),
        },
      ]
    }
  ];

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setCollapsed(!collapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapsed]);

  // Render a nav item with tooltip when collapsed
  const renderNavItem = (item: any) => {
    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          pathname === item.href
            ? "bg-purple-600 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        )}
      >
        <item.icon size={20} className="shrink-0" />
        {!collapsed && <span className="ml-3 text-sm">{item.name}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  return (
    <div className={cn("flex flex-col h-screen bg-slate-800 text-white", 
                     collapsed ? "w-16" : "w-64", 
                     className)}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/images/LoZi.png" 
              alt="ZiindiPro Logo" 
              width={28} 
              height={28} 
              className="mr-2"
            />
            <span className="font-bold text-lg">Ziindi<span className="text-purple-400">Pro</span></span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <Image 
              src="/images/ziindiSoft.png" 
              alt="ZiindiPro Logo" 
              width={24} 
              height={24} 
            />
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-slate-700"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6 px-2">
          {navCategories.map((category, idx) => {
            // Filter items that should be shown
            const visibleItems = category.items.filter(item => item.show);
            
            // Skip rendering the category if no items are visible
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={idx} className="space-y-1">
                {!collapsed && (
                  <h3 className="text-xs uppercase text-slate-500 font-semibold px-3 mb-2">
                    {category.name}
                  </h3>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => (
                    <li key={item.href}>
                      {renderNavItem(item)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        {user && (
          <div className={cn("flex items-center mb-4", collapsed && "justify-center")}>
            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
            </div>
            {!collapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )
}